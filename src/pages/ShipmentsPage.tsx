import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Shipment, ShipmentStatus, FleetVehiclePreset, TransportAssignment, OrderTimelineEvent } from '../types';
import { shipmentService, FLEET_VEHICLE_PRESETS } from '../services/shipmentService';
import {
  Truck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Navigation,
  ExternalLink,
  Phone,
  User,
  Calendar,
  MapPin,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  X,
  Plus,
  RefreshCw,
  QrCode,
  FileText,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowUpDown,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ShipmentsPage: React.FC = () => {
  const { t, formatNumber } = useLanguage();
  const {
    orders,
    currentRole,
    assignTransport,
    dispatchShipment,
    markDelivered,
    openPassportModal,
    setActiveTab,
    shipmentInitialFilter,
    setShipmentInitialFilter
  } = useApp();

  // Shipments state synced from orders & overrides
  const [shipments, setShipments] = useState<Shipment[]>(() => shipmentService.getShipments(orders));

  const refreshShipments = () => {
    setShipments(shipmentService.getShipments(orders));
  };

  useEffect(() => {
    refreshShipments();

    const handleShipmentsUpdated = () => refreshShipments();
    window.addEventListener('shipments-updated', handleShipmentsUpdated);
    window.addEventListener('storage', handleShipmentsUpdated);

    return () => {
      window.removeEventListener('shipments-updated', handleShipmentsUpdated);
      window.removeEventListener('storage', handleShipmentsUpdated);
    };
  }, [orders]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [destinationFilter, setDestinationFilter] = useState<string>('ALL');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'PAST'>('ALL');

  // Handle incoming initial filter from Logistics Dashboard
  useEffect(() => {
    if (shipmentInitialFilter) {
      if (shipmentInitialFilter === 'In Transit' || shipmentInitialFilter === 'Delivered' || shipmentInitialFilter === 'Pending' || shipmentInitialFilter === 'Assigned' || shipmentInitialFilter === 'Delayed') {
        setStatusFilter(shipmentInitialFilter as ShipmentStatus);
      }
      // Reset after consuming
      setShipmentInitialFilter(null);
    }
  }, [shipmentInitialFilter, setShipmentInitialFilter]);

  // Modals state
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Assignment Modal Form
  const [assignForm, setAssignForm] = useState({
    carrierName: 'Sundar Transport & Cold Chain',
    vehicleNumber: 'TN-15-AGRI-5510',
    vehicleType: 'Tata Ace CoolReefer EV 5.5T',
    driverName: 'Karthik Subramanian',
    driverPhone: '+91 98410 44021',
    pickupDate: 'Today, 08:00 AM',
    expectedDelivery: 'Today, 04:30 PM',
    targetTempC: 4.0
  });

  // Status Update Modal Form
  const [statusUpdateForm, setStatusUpdateForm] = useState<{
    newStatus: ShipmentStatus;
    notes: string;
    actualTempC: number;
    delayReason: string;
    revisedEta: string;
  }>({
    newStatus: 'In Transit',
    notes: '',
    actualTempC: 4.2,
    delayReason: '',
    revisedEta: ''
  });

  const showSuccessBanner = (msg: string) => {
    setActionSuccessNotice(msg);
    confetti({ particleCount: 35, origin: { y: 0.6 } });
    setTimeout(() => setActionSuccessNotice(null), 4500);
  };

  // Distinct lists for filter options
  const uniqueDestinations = useMemo(() => {
    const list = shipments.map((s) => s.deliveryLocation).filter(Boolean);
    return Array.from(new Set(list));
  }, [shipments]);

  const uniqueDrivers = useMemo(() => {
    const list = shipments.map((s) => s.assignedDriver).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [shipments]);

  const uniqueVehicles = useMemo(() => {
    const list = shipments.map((s) => s.assignedVehicle).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [shipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesQuery =
          s.id.toLowerCase().includes(q) ||
          s.orderId.toLowerCase().includes(q) ||
          s.crop.toLowerCase().includes(q) ||
          s.farmerName.toLowerCase().includes(q) ||
          s.buyerName.toLowerCase().includes(q) ||
          s.pickupLocation.toLowerCase().includes(q) ||
          s.deliveryLocation.toLowerCase().includes(q) ||
          (s.assignedDriver && s.assignedDriver.toLowerCase().includes(q)) ||
          (s.assignedVehicle && s.assignedVehicle.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Status
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'GROUP_PENDING') {
          if (!['Pending', 'Assigned', 'Pickup Scheduled'].includes(s.status)) return false;
        } else if (statusFilter === 'GROUP_IN_TRANSIT') {
          if (!['In Transit', 'Picked Up'].includes(s.status)) return false;
        } else {
          if (s.status !== statusFilter) return false;
        }
      }

      // Destination
      if (destinationFilter !== 'ALL') {
        if (s.deliveryLocation !== destinationFilter) return false;
      }

      // Driver
      if (driverFilter !== 'ALL') {
        if (s.assignedDriver !== driverFilter) return false;
      }

      // Vehicle
      if (vehicleFilter !== 'ALL') {
        if (s.assignedVehicle !== vehicleFilter) return false;
      }

      return true;
    });
  }, [shipments, searchQuery, statusFilter, destinationFilter, driverFilter, vehicleFilter]);

  // Overview Counts
  const counts = useMemo(() => {
    const total = shipments.length;
    const pendingPickup = shipments.filter(
      (s) => s.status === 'Pending' || s.status === 'Assigned' || s.status === 'Pickup Scheduled'
    ).length;
    const inTransit = shipments.filter((s) => s.status === 'In Transit' || s.status === 'Picked Up').length;
    const delivered = shipments.filter((s) => s.status === 'Delivered').length;
    const delayed = shipments.filter((s) => s.status === 'Delayed').length;
    return { total, pendingPickup, inTransit, delivered, delayed };
  }, [shipments]);

  // Handlers
  const handleOpenAssignModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    const defaultPreset = FLEET_VEHICLE_PRESETS[0];
    setAssignForm({
      carrierName: shipment.carrierName || defaultPreset.carrierName,
      vehicleNumber: shipment.assignedVehicle || defaultPreset.vehicleNumber,
      vehicleType: shipment.vehicleType || defaultPreset.vehicleType,
      driverName: shipment.assignedDriver || defaultPreset.driverName,
      driverPhone: shipment.driverPhone || defaultPreset.driverPhone,
      pickupDate: shipment.pickupDate || 'Today, 08:00 AM',
      expectedDelivery: shipment.expectedDelivery || 'Today, 04:30 PM',
      targetTempC: defaultPreset.reeferTempTargetC
    });
    setIsAssignModalOpen(true);
  };

  const handleApplyVehiclePreset = (preset: FleetVehiclePreset) => {
    setAssignForm((prev) => ({
      ...prev,
      vehicleNumber: preset.vehicleNumber,
      vehicleType: preset.vehicleType,
      driverName: preset.driverName,
      driverPhone: preset.driverPhone,
      carrierName: preset.carrierName,
      targetTempC: preset.reeferTempTargetC
    }));
  };

  const handleSaveAssignment = () => {
    if (!selectedShipment) return;

    const transport: TransportAssignment = {
      carrierName: assignForm.carrierName,
      vehicleNumber: assignForm.vehicleNumber,
      driverName: assignForm.driverName,
      driverPhone: assignForm.driverPhone,
      vehicleType: assignForm.vehicleType,
      departureTime: assignForm.pickupDate,
      estimatedArrival: assignForm.expectedDelivery,
      assignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperatureC: assignForm.targetTempC
    };

    // Update order in AppContext if linked
    if (selectedShipment.orderId) {
      assignTransport(selectedShipment.orderId, transport);
    }

    // Save override to persistent shipmentService
    const updatedTimeline: OrderTimelineEvent[] = [
      ...selectedShipment.timeline,
      {
        step: 'ASSIGNED',
        title: `Vehicle Assigned: ${assignForm.vehicleNumber} (${assignForm.vehicleType})`,
        location: selectedShipment.pickupLocation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        operator: `Driver: ${assignForm.driverName}`,
        completed: true,
        notes: `Carrier: ${assignForm.carrierName}. Reefer target: ${assignForm.targetTempC}°C.`
      }
    ];

    shipmentService.saveOverride(selectedShipment.id, {
      assignedVehicle: assignForm.vehicleNumber,
      vehicleType: assignForm.vehicleType,
      assignedDriver: assignForm.driverName,
      driverPhone: assignForm.driverPhone,
      carrierName: assignForm.carrierName,
      pickupDate: assignForm.pickupDate,
      expectedDelivery: assignForm.expectedDelivery,
      status: 'Assigned',
      temperatureC: assignForm.targetTempC,
      timeline: updatedTimeline
    });

    setIsAssignModalOpen(false);
    refreshShipments();
    showSuccessBanner(
      `Vehicle ${assignForm.vehicleNumber} and Driver ${assignForm.driverName} assigned to shipment ${selectedShipment.id}!`
    );
  };

  const handleOpenStatusModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setStatusUpdateForm({
      newStatus: shipment.status === 'Pending' ? 'Assigned' : shipment.status === 'Assigned' ? 'Pickup Scheduled' : shipment.status === 'Pickup Scheduled' ? 'Picked Up' : shipment.status === 'Picked Up' ? 'In Transit' : shipment.status === 'In Transit' ? 'Delivered' : shipment.status,
      notes: '',
      actualTempC: typeof shipment.temperatureC === 'number' ? shipment.temperatureC : 4.0,
      delayReason: '',
      revisedEta: ''
    });
    setIsStatusModalOpen(true);
  };

  const handleSaveStatusUpdate = () => {
    if (!selectedShipment) return;

    const { newStatus, notes, actualTempC, delayReason, revisedEta } = statusUpdateForm;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Sync with order context lifecycle
    if (newStatus === 'In Transit' && selectedShipment.orderId) {
      dispatchShipment(selectedShipment.orderId);
    } else if (newStatus === 'Delivered' && selectedShipment.orderId) {
      markDelivered(selectedShipment.orderId);
    }

    const updatedTimeline: OrderTimelineEvent[] = [
      ...selectedShipment.timeline,
      {
        step: newStatus.toUpperCase().replace(/\s+/g, '_'),
        title: `Status Updated: ${newStatus}`,
        location: newStatus === 'Delivered' ? selectedShipment.deliveryLocation : selectedShipment.pickupLocation,
        timestamp: nowTime,
        operator: selectedShipment.assignedDriver || 'Logistics Carrier',
        completed: true,
        notes: notes || (delayReason ? `Delay Reason: ${delayReason}. Revised ETA: ${revisedEta}` : undefined)
      }
    ];

    shipmentService.saveOverride(selectedShipment.id, {
      status: newStatus,
      temperatureC: actualTempC,
      notes: notes || delayReason || selectedShipment.notes,
      expectedDelivery: revisedEta || selectedShipment.expectedDelivery,
      deliveredAt: newStatus === 'Delivered' ? nowTime : selectedShipment.deliveredAt,
      timeline: updatedTimeline
    });

    setIsStatusModalOpen(false);
    refreshShipments();
    showSuccessBanner(`Shipment ${selectedShipment.id} status transitioned to "${newStatus}"!`);
  };

  const handleOpenDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailsModalOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDestinationFilter('ALL');
    setDriverFilter('ALL');
    setVehicleFilter('ALL');
    setDateFilter('ALL');
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Assigned':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Pickup Scheduled':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Picked Up':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'In Transit':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse';
      case 'Delivered':
        return 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/60';
      case 'Delayed':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-8 border border-[#01472e]/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#fefae0]/15 border border-[#fefae0]/25 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-[#fefae0]">
              <Truck className="w-3.5 h-3.5 text-[#fefae0]" />
              <span>{t('shipments.badge', 'Cold-Chain Freight Dispatch & Telematics')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t('shipments.title', 'Shipment Management Console')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl">
              {t(
                'shipments.subtitle',
                'Track agricultural consignments, assign reefers and drivers, monitor temperature telematics, and verify destination delivery handovers.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('route-optimization')}
              className="flex items-center gap-2 bg-[#fefae0] hover:bg-white text-[#01472e] text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-soft transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#01472e]" />
              <span>{t('shipments.optimizeRouteBtn', 'Route Optimization')}</span>
            </button>
            <button
              onClick={refreshShipments}
              className="flex items-center gap-2 bg-emerald-700/60 hover:bg-emerald-700/80 text-[#fefae0] border border-emerald-400/30 text-xs font-semibold px-3 py-2.5 rounded-2xl shadow-soft transition-all cursor-pointer"
              title="Refresh Shipments"
            >
              <RefreshCw className="w-4 h-4 text-emerald-300" />
              <span>{t('common.refresh', 'Sync')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccessNotice && (
        <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/60 rounded-2xl flex items-center justify-between shadow-soft animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#01472e] text-[#fefae0] flex items-center justify-center font-bold text-sm shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#fefae0]" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#01472e]">{actionSuccessNotice}</p>
          </div>
          <button
            onClick={() => setActionSuccessNotice(null)}
            className="text-[#01472e]/60 hover:text-[#01472e] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 1. Shipment Overview KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {[
          {
            key: 'ALL' as const,
            label: t('shipments.kpi.total', 'Total Shipments'),
            count: counts.total,
            desc: 'All Consignments',
            icon: Package,
            color: 'text-slate-800',
            bg: 'bg-slate-50',
            border: 'border-slate-200'
          },
          {
            key: 'GROUP_PENDING' as const,
            label: t('shipments.kpi.pending', 'Pending Pickup'),
            count: counts.pendingPickup,
            desc: 'Awaiting / Scheduled',
            icon: Clock,
            color: 'text-amber-800',
            bg: 'bg-amber-50',
            border: 'border-amber-200'
          },
          {
            key: 'GROUP_IN_TRANSIT' as const,
            label: t('shipments.kpi.inTransit', 'In Transit'),
            count: counts.inTransit,
            desc: 'Active Telematics',
            icon: Truck,
            color: 'text-emerald-800',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200'
          },
          {
            key: 'Delivered' as const,
            label: t('shipments.kpi.delivered', 'Delivered'),
            count: counts.delivered,
            desc: 'Buyer Signed-off',
            icon: CheckCircle2,
            color: 'text-[#01472e]',
            bg: 'bg-[#eaf4ec]',
            border: 'border-[#a3b18a]/60'
          },
          {
            key: 'Delayed' as const,
            label: t('shipments.kpi.delayed', 'Delayed'),
            count: counts.delayed,
            desc: 'Action Needed',
            icon: AlertTriangle,
            color: 'text-red-800',
            bg: 'bg-red-50',
            border: 'border-red-200'
          }
        ].map((card) => {
          const Icon = card.icon;
          const isActive = statusFilter === card.key;
          return (
            <button
              key={card.label}
              onClick={() => setStatusFilter(card.key as any)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white shadow-md ring-2 ring-[#01472e] border-transparent'
                  : 'bg-white/80 hover:bg-white border-[#ccd5ae]/40 hover:shadow-soft'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                {isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#01472e] text-[#fefae0] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">{card.count}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">{card.label}</p>
              <p className="text-[11px] text-slate-500 font-normal">{card.desc}</p>
            </button>
          );
        })}
      </div>

      {/* ── 6. Search and Multi-Filters ── */}
      <div className="bg-white rounded-3xl p-5 border border-[#ccd5ae]/40 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Shipment ID, Order ID, Crop, Driver, Vehicle, Destination..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#faf9f5] border border-[#ccd5ae]/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#01472e]/20 focus:border-[#01472e] text-[#01472e] placeholder:text-slate-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear Button */}
          {(searchQuery ||
            statusFilter !== 'ALL' ||
            destinationFilter !== 'ALL' ||
            driverFilter !== 'ALL' ||
            vehicleFilter !== 'ALL') && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-[#faf9f5] border border-[#ccd5ae]/60 rounded-xl p-2 focus:ring-1 focus:ring-[#01472e] focus:outline-none text-[#01472e]"
            >
              <option value="ALL">All Statuses</option>
              <optgroup label="KPI Groups">
                <option value="GROUP_PENDING">Pending Pickup (Group)</option>
                <option value="GROUP_IN_TRANSIT">In Transit (Group)</option>
              </optgroup>
              <optgroup label="Individual Statuses">
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="Pickup Scheduled">Pickup Scheduled</option>
                <option value="Picked Up">Picked Up</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
              </optgroup>
            </select>
          </div>

          {/* Destination Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Destination</label>
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="w-full text-xs bg-[#faf9f5] border border-[#ccd5ae]/60 rounded-xl p-2 focus:ring-1 focus:ring-[#01472e] focus:outline-none text-[#01472e] truncate"
            >
              <option value="ALL">All Destinations</option>
              {uniqueDestinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Driver Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assigned Driver</label>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="w-full text-xs bg-[#faf9f5] border border-[#ccd5ae]/60 rounded-xl p-2 focus:ring-1 focus:ring-[#01472e] focus:outline-none text-[#01472e]"
            >
              <option value="ALL">All Drivers</option>
              {uniqueDrivers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assigned Vehicle</label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full text-xs bg-[#faf9f5] border border-[#ccd5ae]/60 rounded-xl p-2 focus:ring-1 focus:ring-[#01472e] focus:outline-none text-[#01472e]"
            >
              <option value="ALL">All Fleet Vehicles</option>
              {uniqueVehicles.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 2. Shipment List / Table ── */}
      <div className="bg-white rounded-3xl border border-[#ccd5ae]/40 shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#01472e] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#01472e]" />
              <span>Consignment Manifest ({filteredShipments.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Showing active refrigerated logistics shipments conforming to cold-chain protocol.
            </p>
          </div>
          <span className="text-xs bg-[#faf9f5] text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 self-start sm:self-auto font-medium">
            Active Fleet: <strong>{uniqueVehicles.length} Vehicles</strong>
          </span>
        </div>

        {filteredShipments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No shipments matched your filters</p>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or resetting filters.</p>
            <button
              onClick={clearAllFilters}
              className="mt-2 text-xs font-semibold text-[#01472e] bg-[#eaf4ec] hover:bg-[#d8ebd9] px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Show All Shipments
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#faf9f5] text-slate-600 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Shipment & Order ID</th>
                  <th className="py-3.5 px-4">Crop & Qty</th>
                  <th className="py-3.5 px-4">Origin & Destination</th>
                  <th className="py-3.5 px-4">Assigned Fleet & Driver</th>
                  <th className="py-3.5 px-4">Dates & ETA</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.map((shipment) => {
                  return (
                    <tr
                      key={shipment.id}
                      className="hover:bg-[#faf9f5]/70 transition-colors group cursor-default"
                    >
                      {/* Shipment & Order ID */}
                      <td className="py-4 px-4 font-mono">
                        <button
                          onClick={() => handleOpenDetails(shipment)}
                          className="font-bold text-[#01472e] hover:underline text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>{shipment.id}</span>
                        </button>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Order: {shipment.orderId}
                        </span>
                        {shipment.temperatureC !== undefined && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-1 border border-emerald-200">
                            <Thermometer className="w-3 h-3 text-emerald-600" />
                            <span>{shipment.temperatureC}°C Reefer</span>
                          </span>
                        )}
                      </td>

                      {/* Crop & Quantity */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block text-xs">{shipment.crop}</span>
                        <span className="text-[11px] text-slate-500 block">{shipment.variety}</span>
                        <span className="text-[11px] font-semibold text-[#01472e] block mt-0.5">
                          {formatNumber(shipment.quantityKg)} kg
                        </span>
                      </td>

                      {/* Origin & Destination */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-700 truncate" title={shipment.pickupLocation}>
                            {shipment.pickupLocation}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#01472e] shrink-0 mt-0.5" />
                          <span
                            className="text-[11px] font-medium text-slate-900 truncate"
                            title={shipment.deliveryLocation}
                          >
                            {shipment.deliveryLocation}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          To: {shipment.buyerName}
                        </span>
                      </td>

                      {/* Fleet & Driver */}
                      <td className="py-4 px-4">
                        {shipment.assignedVehicle ? (
                          <div>
                            <span className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{shipment.assignedVehicle}</span>
                            </span>
                            <span className="text-[11px] text-slate-600 block mt-0.5 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{shipment.assignedDriver}</span>
                            </span>
                            {shipment.driverPhone && (
                              <a
                                href={`tel:${shipment.driverPhone}`}
                                className="text-[10px] text-indigo-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{shipment.driverPhone}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-block">
                              Unassigned
                            </span>
                            <button
                              onClick={() => handleOpenAssignModal(shipment)}
                              className="text-[11px] text-[#01472e] font-semibold hover:underline block cursor-pointer"
                            >
                              + Assign Vehicle
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Dates & ETA */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[11px] text-slate-500 block">
                          Pickup: {shipment.pickupDate || 'Awaiting'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-800 block mt-0.5">
                          ETA: {shipment.expectedDelivery || 'TBD'}
                        </span>
                        {shipment.status === 'Delivered' && shipment.deliveredAt && (
                          <span className="text-[10px] text-emerald-700 block">
                            Delivered: {shipment.deliveredAt}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            shipment.status
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{shipment.status}</span>
                        </span>
                        {shipment.status === 'Delayed' && shipment.notes && (
                          <span
                            className="block text-[10px] text-red-600 max-w-[150px] truncate mt-1"
                            title={shipment.notes}
                          >
                            {shipment.notes}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(shipment)}
                            className="p-1.5 text-slate-600 hover:text-[#01472e] hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            title="View Shipment Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {!shipment.assignedVehicle && (
                            <button
                              onClick={() => handleOpenAssignModal(shipment)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                              title="Assign Fleet Vehicle"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenStatusModal(shipment)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                            title="Update Status / Record Event"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setActiveTab('route-optimization')}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            title="View Route Optimization"
                          >
                            <Navigation className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Shipment Details Modal ── */}
      {isDetailsModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#faf9f5] to-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#01472e]">{selectedShipment.id}</h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                      selectedShipment.status
                    )}`}
                  >
                    {selectedShipment.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Linked Workflow Order: <strong>{selectedShipment.orderId}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Product & Consignment Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf9f5] p-4 rounded-2xl border border-[#ccd5ae]/40">
                <div>
                  <span className="text-[11px] text-slate-500 block">Produce</span>
                  <strong className="text-slate-900 text-sm">{selectedShipment.crop}</strong>
                  <span className="text-[10px] text-slate-500 block">{selectedShipment.variety}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Consignment Load</span>
                  <strong className="text-[#01472e] text-sm">
                    {formatNumber(selectedShipment.quantityKg)} kg
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Reefer Temperature</span>
                  <strong className="text-emerald-700 text-sm flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>{selectedShipment.temperatureC || 4.0}°C</span>
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Expected Arrival</span>
                  <strong className="text-slate-900 text-sm">{selectedShipment.expectedDelivery}</strong>
                </div>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Origin / Pickup Location</span>
                  </div>
                  <p className="font-semibold text-slate-900">{selectedShipment.farmerName}</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {selectedShipment.pickupLocation}
                  </p>
                  <p className="text-[10px] text-slate-400">Scheduled: {selectedShipment.pickupDate}</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#01472e] font-semibold text-xs">
                    <MapPin className="w-4 h-4 text-[#01472e]" />
                    <span>Destination / Delivery Dock</span>
                  </div>
                  <p className="font-semibold text-slate-900">{selectedShipment.buyerName}</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {selectedShipment.deliveryLocation}
                  </p>
                  <p className="text-[10px] text-slate-400">Target ETA: {selectedShipment.expectedDelivery}</p>
                </div>
              </div>

              {/* Assigned Fleet & Driver */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#01472e]" />
                  <span>Assigned Cold-Chain Vehicle & Driver</span>
                </h4>
                {selectedShipment.assignedVehicle ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vehicle Number</span>
                      <strong className="text-slate-900 text-xs">{selectedShipment.assignedVehicle}</strong>
                      <span className="text-[10px] text-slate-500 block">{selectedShipment.vehicleType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Driver Name</span>
                      <strong className="text-slate-900 text-xs">{selectedShipment.assignedDriver}</strong>
                      {selectedShipment.driverPhone && (
                        <a
                          href={`tel:${selectedShipment.driverPhone}`}
                          className="text-[10px] text-indigo-600 hover:underline block"
                        >
                          {selectedShipment.driverPhone}
                        </a>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Carrier Provider</span>
                      <strong className="text-slate-900 text-xs">
                        {selectedShipment.carrierName || 'Sundar Logistics'}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-amber-700 text-xs">
                    No vehicle assigned yet. Please assign a vehicle before dispatch.
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 text-xs">Shipment Audit Timeline</h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedShipment.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                          event.completed ? 'bg-[#01472e]' : 'bg-slate-300'
                        } flex items-center justify-center`}
                      >
                        {event.completed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{event.title}</span>
                          <span className="text-[10px] text-slate-400">{event.timestamp}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">{event.location}</span>
                        {event.operator && (
                          <span className="text-[10px] text-slate-400 block">By: {event.operator}</span>
                        )}
                        {event.notes && (
                          <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-[#faf9f5] flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleOpenAssignModal(selectedShipment);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
                >
                  Assign Fleet
                </button>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleOpenStatusModal(selectedShipment);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition cursor-pointer"
                >
                  Update Status
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setActiveTab('route-optimization');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#01472e] bg-white border border-[#ccd5ae]/60 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View Route Map</span>
                </button>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4a. Driver & Vehicle Assignment Modal ── */}
      {isAssignModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#01472e] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#01472e]" />
                  <span>Assign Vehicle & Driver</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Shipment: <strong>{selectedShipment.id}</strong> ({selectedShipment.crop} -{' '}
                  {formatNumber(selectedShipment.quantityKg)} kg)
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Quick Select Available Fleet:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FLEET_VEHICLE_PRESETS.map((preset) => (
                  <button
                    key={preset.vehicleNumber}
                    type="button"
                    onClick={() => handleApplyVehiclePreset(preset)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                      assignForm.vehicleNumber === preset.vehicleNumber
                        ? 'border-[#01472e] bg-[#eaf4ec] text-[#01472e] font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block font-bold truncate">{preset.vehicleNumber}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{preset.vehicleType}</span>
                    <span className="text-[10px] text-indigo-600 block">{preset.driverName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carrier Name</label>
                <input
                  type="text"
                  value={assignForm.carrierName}
                  onChange={(e) => setAssignForm({ ...assignForm, carrierName: e.target.value })}
                  className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={assignForm.vehicleNumber}
                    onChange={(e) => setAssignForm({ ...assignForm, vehicleNumber: e.target.value })}
                    className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Type / Specs</label>
                  <input
                    type="text"
                    value={assignForm.vehicleType}
                    onChange={(e) => setAssignForm({ ...assignForm, vehicleType: e.target.value })}
                    className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={assignForm.driverName}
                    onChange={(e) => setAssignForm({ ...assignForm, driverName: e.target.value })}
                    className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={assignForm.driverPhone}
                    onChange={(e) => setAssignForm({ ...assignForm, driverPhone: e.target.value })}
                    className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Pickup Time</label>
                  <input
                    type="text"
                    value={assignForm.pickupDate}
                    onChange={(e) => setAssignForm({ ...assignForm, pickupDate: e.target.value })}
                    className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Delivery ETA</label>
                  <input
                    type="text"
                    value={assignForm.expectedDelivery}
                    onChange={(e) => setAssignForm({ ...assignForm, expectedDelivery: e.target.value })}
                    className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#01472e] hover:bg-[#025a3b] rounded-xl shadow-soft cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4b. Status Update Modal ── */}
      {isStatusModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#01472e]">Update Shipment Status</h3>
                <p className="text-xs text-slate-500">
                  Shipment: <strong>{selectedShipment.id}</strong> (Current: {selectedShipment.status})
                </p>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Status</label>
                <select
                  value={statusUpdateForm.newStatus}
                  onChange={(e) =>
                    setStatusUpdateForm({
                      ...statusUpdateForm,
                      newStatus: e.target.value as ShipmentStatus
                    })
                  }
                  className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                >
                  {(() => {
                    const flow = ['Pending', 'Assigned', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Delivered'];
                    const currentIndex = flow.indexOf(selectedShipment.status);
                    
                    const isDisabled = (status: string) => {
                      const targetIndex = flow.indexOf(status);
                      if (currentIndex === -1 || targetIndex === -1) return false;
                      return targetIndex < currentIndex;
                    };

                    const isTerminal = selectedShipment.status === 'Delivered' || selectedShipment.status === 'Cancelled';

                    return (
                      <>
                        <option value="Assigned" disabled={isDisabled('Assigned') || isTerminal}>Assigned</option>
                        <option value="Pickup Scheduled" disabled={isDisabled('Pickup Scheduled') || isTerminal}>Pickup Scheduled</option>
                        <option value="Picked Up" disabled={isDisabled('Picked Up') || isTerminal}>Picked Up (Loaded at Hub)</option>
                        <option value="In Transit" disabled={isDisabled('In Transit') || isTerminal}>In Transit (Dispatched on Highway)</option>
                        <option value="Delivered" disabled={isDisabled('Delivered') || selectedShipment.status === 'Cancelled'}>Delivered (Arrived at Receiving Dock)</option>
                        <option value="Delayed" disabled={isTerminal}>Delayed (Exception Alert)</option>
                        <option value="Cancelled" disabled={isTerminal && selectedShipment.status !== 'Cancelled'}>Cancelled</option>
                      </>
                    );
                  })()}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reefer Temperature Telematics (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={statusUpdateForm.actualTempC}
                  onChange={(e) =>
                    setStatusUpdateForm({
                      ...statusUpdateForm,
                      actualTempC: parseFloat(e.target.value) || 4.0
                    })
                  }
                  className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              {statusUpdateForm.newStatus === 'Delayed' && (
                <>
                  <div>
                    <label className="block font-semibold text-red-700 mb-1">Delay Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Highway weather detour, mechanical maintenance, traffic diversion..."
                      value={statusUpdateForm.delayReason}
                      onChange={(e) =>
                        setStatusUpdateForm({
                          ...statusUpdateForm,
                          delayReason: e.target.value
                        })
                      }
                      className="w-full bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Revised ETA</label>
                    <input
                      type="text"
                      placeholder="e.g. Today, 08:30 PM (+2.5 hrs)"
                      value={statusUpdateForm.revisedEta}
                      onChange={(e) =>
                        setStatusUpdateForm({
                          ...statusUpdateForm,
                          revisedEta: e.target.value
                        })
                      }
                      className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Notes</label>
                <textarea
                  rows={3}
                  placeholder="Record carrier inspection, temperature log, driver checkpoint..."
                  value={statusUpdateForm.notes}
                  onChange={(e) =>
                    setStatusUpdateForm({
                      ...statusUpdateForm,
                      notes: e.target.value
                    })
                  }
                  className="w-full bg-[#faf9f5] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatusUpdate}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#01472e] hover:bg-[#025a3b] rounded-xl shadow-soft cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
