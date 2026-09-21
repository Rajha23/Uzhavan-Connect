import { WorkflowOrder, Shipment, ShipmentStatus, FleetVehiclePreset, OrderTimelineEvent } from '../types';

const SHIPMENTS_STORAGE_KEY = 'uzhavan_shipments_overrides_v1';

export const FLEET_VEHICLE_PRESETS: FleetVehiclePreset[] = [
  {
    vehicleNumber: 'TN-15-AGRI-5510',
    vehicleType: 'Tata Ace CoolReefer EV 5.5T',
    capacityKg: 5500,
    driverName: 'Karthik Subramanian',
    driverPhone: '+91 98410 44021',
    carrierName: 'Sundar Transport & Cold Chain',
    reeferTempTargetC: 4.0
  },
  {
    vehicleNumber: 'TN-45-AT-9080',
    vehicleType: 'Ashok Leyland Dost Reefer 3.5T',
    capacityKg: 3500,
    driverName: 'Suresh Kumar',
    driverPhone: '+91 98411 77620',
    carrierName: 'Sundar Transport & Cold Chain',
    reeferTempTargetC: 3.5
  },
  {
    vehicleNumber: 'TN-30-COOL-1020',
    vehicleType: 'Mahindra Furio Reefer 7.5T',
    capacityKg: 7500,
    driverName: 'Murugan S.',
    driverPhone: '+91 94432 55091',
    carrierName: 'Sundar Transport & Cold Chain',
    reeferTempTargetC: 4.5
  },
  {
    vehicleNumber: 'TN-02-AG-8822',
    vehicleType: 'Eicher Pro 2049 Reefer 4.9T',
    capacityKg: 4900,
    driverName: 'Anbu Chezhian',
    driverPhone: '+91 98840 33219',
    carrierName: 'Sundar Transport & Cold Chain',
    reeferTempTargetC: 5.0
  }
];

export const INITIAL_DEMO_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-TN-5510',
    orderId: 'ORD-TOMATO-01',
    farmerId: 'usr_farmer_1',
    farmerName: 'Ramu (Kallakurichi Pasumai FPO)',
    buyerId: 'usr_retail_1',
    buyerName: 'Reliance Fresh Distribution Center',
    crop: 'Tomato',
    variety: 'Sivam Hybrid',
    quantityKg: 5000,
    pickupLocation: 'Chinnasalem Agro Consolidation Hub, Kallakurichi',
    deliveryLocation: 'Reliance Fresh Central DC, Koyambedu, Chennai',
    assignedVehicle: 'TN-15-AGRI-5510',
    assignedDriver: 'Karthik Subramanian',
    driverPhone: '+91 98410 44021',
    vehicleType: 'Tata Ace CoolReefer EV 5.5T',
    carrierName: 'Sundar Transport & Cold Chain',
    pickupDate: new Date(Date.now() - 3600000 * 4).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    expectedDelivery: 'Today, 05:30 PM',
    status: 'In Transit',
    temperatureC: 4.2,
    routeId: 'RTE-TN-2026-09-15',
    timeline: [
      {
        step: 'PACKED',
        title: 'Packed & QR Sealed at FPO Hub',
        location: 'Chinnasalem Hub Bay 1',
        timestamp: 'Today, 09:30 AM',
        operator: 'Dr. R. Malathi (QA)',
        completed: true
      },
      {
        step: 'ASSIGNED',
        title: 'Reefer Freight Assigned',
        location: 'Sundar Dispatch Control',
        timestamp: 'Today, 10:15 AM',
        operator: 'Sundar Logistics',
        completed: true
      },
      {
        step: 'PICKED_UP',
        title: 'Loaded & Chilling Protocol Verified (4.0°C)',
        location: 'Chinnasalem Agro Hub',
        timestamp: 'Today, 11:30 AM',
        operator: 'Karthik Subramanian',
        completed: true
      },
      {
        step: 'IN_TRANSIT',
        title: 'En Route via NH-79 / NH-48 Express Corridor',
        location: 'Near Ulundurpet Toll (Speed: 58 km/h)',
        timestamp: 'Today, 01:45 PM',
        operator: 'GPS Telematics Unit',
        completed: true
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-TN-9080',
    orderId: 'ORD-ONION-02',
    farmerId: 'usr-farmer-02',
    farmerName: 'K. Velusamy & Pennagaram Collective',
    buyerId: 'usr_bulk_1',
    buyerName: 'WayCool Agri Processors Terminal',
    crop: 'Onion',
    variety: 'Nasik Red Cured',
    quantityKg: 3500,
    pickupLocation: 'Pennagaram Aggregation Depot, Dharmapuri',
    deliveryLocation: 'Ambattur Food Processing Terminal, Chennai',
    assignedVehicle: 'TN-45-AT-9080',
    assignedDriver: 'Suresh Kumar',
    driverPhone: '+91 98411 77620',
    vehicleType: 'Ashok Leyland Dost Reefer 3.5T',
    carrierName: 'Sundar Transport & Cold Chain',
    pickupDate: 'Tomorrow, 07:00 AM',
    expectedDelivery: 'Tomorrow, 02:30 PM',
    status: 'Pickup Scheduled',
    temperatureC: 18.0,
    routeId: 'RTE-TN-DHARMA-AMB',
    timeline: [
      {
        step: 'QUALITY_PASSED',
        title: 'NABL Certified Quality Grading (Standard Grade)',
        location: 'Pennagaram Hub',
        timestamp: 'Yesterday, 04:00 PM',
        operator: 'Field QA Inspector',
        completed: true
      },
      {
        step: 'PICKUP_SCHEDULED',
        title: 'Pickup Confirmed with Farm Depot',
        location: 'Pennagaram Agro Depot',
        timestamp: 'Today, 10:00 AM',
        operator: 'Sundar Dispatch Control',
        completed: true
      }
    ],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-TN-1020',
    orderId: 'ORD-TURMERIC-03',
    farmerId: 'usr-farmer-03',
    farmerName: 'Meenakshi Sundaram',
    buyerId: 'usr_bulk_2',
    buyerName: 'Aachi Spices Export Receiving Bay',
    crop: 'Turmeric',
    variety: 'Erode Local Finger',
    quantityKg: 7500,
    pickupLocation: 'Erode Regulated Market Terminal Hub',
    deliveryLocation: 'Aachi Spices Gummidipoondi Logistics Park',
    assignedVehicle: 'TN-30-COOL-1020',
    assignedDriver: 'Murugan S.',
    driverPhone: '+91 94432 55091',
    vehicleType: 'Mahindra Furio Reefer 7.5T',
    carrierName: 'Sundar Transport & Cold Chain',
    pickupDate: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    expectedDelivery: 'Yesterday, 06:00 PM',
    deliveredAt: 'Yesterday, 05:42 PM',
    status: 'Delivered',
    temperatureC: 22.0,
    timeline: [
      {
        step: 'DISPATCHED',
        title: 'Dispatched from Erode',
        location: 'Erode Terminal Hub',
        timestamp: 'Yesterday, 06:00 AM',
        operator: 'Murugan S.',
        completed: true
      },
      {
        step: 'DELIVERED',
        title: 'Delivered & Accepted at Receiving Dock',
        location: 'Aachi Gummidipoondi Bay 4',
        timestamp: 'Yesterday, 05:42 PM',
        operator: 'Receiving Officer (OTP: 894120)',
        completed: true
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-TN-8822',
    orderId: 'ORD-CHILLI-04',
    farmerId: 'usr_farmer_4',
    farmerName: 'Alagarsamy Farmers Producer Group',
    buyerId: 'usr_retail_2',
    buyerName: 'Nilgiris Supermarket Receiving Bay',
    crop: 'Green Chilli',
    variety: 'G4 Sharp Pungent',
    quantityKg: 2000,
    pickupLocation: 'Madurai Mattuthavani Consolidation Hub',
    deliveryLocation: 'Nilgiris Regional Depot, Coimbatore',
    assignedVehicle: 'TN-02-AG-8822',
    assignedDriver: 'Anbu Chezhian',
    driverPhone: '+91 98840 33219',
    vehicleType: 'Eicher Pro 2049 Reefer 4.9T',
    carrierName: 'Sundar Transport & Cold Chain',
    pickupDate: 'Today, 06:00 AM',
    expectedDelivery: 'Today, 11:30 AM',
    status: 'Delayed',
    notes: 'Severe monsoon traffic diversion on NH-83 Dindigul pass. Reefer cooling intact at 5.0°C. Revised ETA +2.5 hrs.',
    temperatureC: 5.1,
    timeline: [
      {
        step: 'PICKED_UP',
        title: 'Produce Loaded at Madurai',
        location: 'Mattuthavani Agro Bay 2',
        timestamp: 'Today, 06:15 AM',
        operator: 'Anbu Chezhian',
        completed: true
      },
      {
        step: 'DELAY_REPORTED',
        title: 'Route Diversion Reported (NH-83 Weather Alert)',
        location: 'Dindigul Bypass',
        timestamp: 'Today, 09:30 AM',
        operator: 'Driver Telematics Alert',
        completed: true,
        notes: 'Highway diversion active. Safe speed maintained.'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-TN-6101',
    orderId: 'ORD-BANANA-05',
    farmerId: 'usr_farmer_5',
    farmerName: 'Cauvery Delta Banana Federation',
    buyerId: 'usr_retail_3',
    buyerName: 'FreshBasket Hypermarket',
    crop: 'Banana',
    variety: 'Grand Naine',
    quantityKg: 4200,
    pickupLocation: 'Thiruvaiyaru Agro Consolidation Hub, Thanjavur',
    deliveryLocation: 'FreshBasket Terminal, Salem',
    status: 'Pending',
    timeline: [
      {
        step: 'PACKED',
        title: 'Packed in Foam-Cushioned Export Crates',
        location: 'Thiruvaiyaru Bay 1',
        timestamp: 'Today, 11:00 AM',
        operator: 'FPO Packing Unit',
        completed: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const shipmentService = {
  loadOverrides(): Record<string, Partial<Shipment>> {
    try {
      const data = localStorage.getItem(SHIPMENTS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse shipment overrides from localStorage', e);
    }
    return {};
  },

  saveOverride(shipmentId: string, updates: Partial<Shipment>) {
    try {
      const current = this.loadOverrides();
      current[shipmentId] = { ...(current[shipmentId] || {}), ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(SHIPMENTS_STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('shipments-updated', { detail: { shipmentId, updates } }));
    } catch (e) {
      console.warn('Failed to save shipment override', e);
    }
  },

  /**
   * Transforms WorkflowOrders and initial demo records into unified Shipments.
   */
  getShipments(orders: WorkflowOrder[]): Shipment[] {
    const overrides = this.loadOverrides();
    const shipmentsMap = new Map<string, Shipment>();

    // 1. Seed with demo shipments
    INITIAL_DEMO_SHIPMENTS.forEach((demo) => {
      shipmentsMap.set(demo.id, { ...demo });
    });

    // 2. Map existing WorkflowOrders that have reached transport readiness or dispatch
    orders.forEach((order) => {
      const isTransportRelevant =
        order.isReadyForTransport ||
        order.transportDetails !== undefined ||
        order.status === 'Packed' ||
        order.status === 'Transport Assigned' ||
        order.status === 'In Transit' ||
        order.status === 'Delivered' ||
        order.status === 'Buyer Confirmation Pending' ||
        order.status === 'Buyer Confirmed' ||
        order.status === 'Payment Pending' ||
        order.status === 'Completed';

      if (!isTransportRelevant) return;

      const derivedShipmentId = `SHP-${order.id.replace('ORD-', '')}`;
      let derivedStatus: ShipmentStatus = 'Pending';

      if (order.status === 'Transport Assigned') derivedStatus = 'Assigned';
      else if (order.status === 'In Transit') derivedStatus = 'In Transit';
      else if (
        order.status === 'Delivered' ||
        order.status === 'Buyer Confirmation Pending' ||
        order.status === 'Buyer Confirmed' ||
        order.status === 'Payment Pending' ||
        order.status === 'Completed'
      ) {
        derivedStatus = 'Delivered';
      }

      // Check if existing
      const existing = shipmentsMap.get(derivedShipmentId) || shipmentsMap.get('SHP-TN-5510');
      
      const shipment: Shipment = {
        id: derivedShipmentId,
        orderId: order.id,
        farmerId: order.farmerId,
        farmerName: order.farmerName,
        buyerId: order.buyerId,
        buyerName: order.buyerName,
        crop: order.crop,
        variety: order.variety || 'Certified Grade A',
        quantityKg: order.quantityKg,
        pickupLocation: order.farmerLocation || 'Consolidated FPO Hub',
        deliveryLocation: order.deliveryLocation,
        assignedVehicle: order.transportDetails?.vehicleNumber || existing?.assignedVehicle,
        assignedDriver: order.transportDetails?.driverName || existing?.assignedDriver,
        driverPhone: order.transportDetails?.driverPhone || existing?.driverPhone,
        vehicleType: order.transportDetails?.vehicleType || existing?.vehicleType,
        carrierName: order.transportDetails?.carrierName || existing?.carrierName || 'Sundar Transport & Cold Chain',
        pickupDate: order.transportDetails?.assignedAt || existing?.pickupDate || 'Scheduled on Demand',
        expectedDelivery: order.transportDetails?.estimatedArrival || existing?.expectedDelivery || 'Within 6 hours',
        status: derivedStatus,
        temperatureC: order.transportDetails?.temperatureC || 4.0,
        timeline: order.timeline && order.timeline.length > 0 ? order.timeline : existing?.timeline || [],
        gpsTracking: order.gpsTracking,
        createdAt: order.date || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      shipmentsMap.set(derivedShipmentId, shipment);
    });

    // 3. Apply local overrides
    const result: Shipment[] = [];
    shipmentsMap.forEach((shipment, key) => {
      const override = overrides[key];
      if (override) {
        result.push({ ...shipment, ...override });
      } else {
        result.push(shipment);
      }
    });

    return result;
  },

  getFleetPresets(): FleetVehiclePreset[] {
    return FLEET_VEHICLE_PRESETS;
  }
};
