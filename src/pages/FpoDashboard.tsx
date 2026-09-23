import { getCropImageUrl } from '../utils/cropImages';
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  Package,
  Sprout,
  CheckCircle2,
  User,
  Phone,
  ShieldCheck,
  QrCode,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  Award,
  Layers,
  Check,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Box,
  ChevronRight,
  ClipboardList,
  ShoppingCart,
  IndianRupee,
  Scale,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  Eye,
  Star,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UpcomingTasksWidget } from '../components/task';
import { QualityVerificationModal } from '../components/quality/QualityVerificationModal';
import {
  QualityInspectionData,
  WorkflowOrder,
  FarmerContribution,
  DemandRequest,
  ProduceListing,
  TransportAssignment
} from '../types';

const AVAILABLE_TRANSPORTS = [
  { id: 'T1', carrierName: 'Sundar Transport & Cold Chain', vehicleNumber: 'TN-45-AT-9080', vehicleType: 'Reefer Truck (4-8°C)', driverName: 'Murugan', driverPhone: '+91 98765 43210', distanceKm: 2.4, status: 'Nearest Available', rating: 4.8 },
  { id: 'T2', carrierName: 'Vayulogix Transport', vehicleNumber: 'TN-09-CB-4812', vehicleType: 'Insulated Van', driverName: 'Velu', driverPhone: '+91 87654 32109', distanceKm: 5.1, status: 'Available', rating: 4.5 },
  { id: 'T3', carrierName: 'Kisan Cold Express', vehicleNumber: 'TN-38-XY-1122', vehicleType: 'Heavy Reefer', driverName: 'Selvam', driverPhone: '+91 76543 21098', distanceKm: 8.7, status: 'Available', rating: 4.9 },
];
export const FpoDashboard: React.FC = () => {
  const { t } = useLanguage();
  const {
    currentUser,
    produceListings,
    demandRequests,
    addDemandRequest,
    orders,
    settlements,
    confirmMatchAndCreateOrder,
    fpoRecordCollection,
    fpoCollectProduce,
    fpoRecordQualityGrading,
    fpoQualityCheck,
    fpoRecordPacking,
    fpoPackProduce,
    assignTransport,
    dispatchShipment,
    markDelivered,
    buyerConfirmReceipt,
    recordBuyerPayment,
    processFpoSettlement,
    openPassportModal,
    activeTab,
    setActiveTab,
    feedbackItems
  } = useApp();

  // 10-Step Demand-Driven Workflow Stage Selection + Preserved Views
  type WorkflowStageKey =
    | 'STAGE_1_DEMAND'
    | 'STAGE_2_MATCHING'
    | 'STAGE_3_APPROVAL'
    | 'STAGE_4_FARMER_SUPPLY'
    | 'STAGE_5_COLLECTION'
    | 'STAGE_6_QUALITY'
    | 'STAGE_7_PACKING'
    | 'STAGE_8_TRANSPORT'
    | 'STAGE_9_DELIVERY'
    | 'STAGE_10_PAYMENT'
    | 'MEMBER_SUPPLY'
    | 'CONSOLIDATION'
    | 'ALL';

  const [activeStage, setActiveStage] = useState<WorkflowStageKey>('STAGE_1_DEMAND');

  useEffect(() => {
    if (activeTab === 'my-crops' && activeStage !== 'MEMBER_SUPPLY' && activeStage !== 'CONSOLIDATION' && activeStage !== 'ALL') {
      setActiveStage('MEMBER_SUPPLY');
    } else if (activeTab === 'dashboard' && !activeStage.startsWith('STAGE_')) {
      setActiveStage('STAGE_1_DEMAND');
    }
  }, [activeTab]);

  const handleSetStage = (stage: WorkflowStageKey) => {
    setActiveStage(stage);
    if (stage === 'MEMBER_SUPPLY' || stage === 'CONSOLIDATION' || stage === 'ALL') {
      setActiveTab('my-crops');
    } else if (stage.startsWith('STAGE_')) {
      setActiveTab('dashboard');
    }
  };

  // Stage 1: Demand Capture Modal & Form State
  const [showCreateDemandModal, setShowCreateDemandModal] = useState(false);
  const [newDemandCrop, setNewDemandCrop] = useState('Tomato');
  const [newDemandVariety, setNewDemandVariety] = useState('Hybrid Shivam / Vaishnavi');
  const [newDemandQty, setNewDemandQty] = useState<number>(2000);
  const [newDemandGrade, setNewDemandGrade] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Premium'>('Grade A');
  const [newDemandPrice, setNewDemandPrice] = useState<number>(42);
  const [newDemandLocation, setNewDemandLocation] = useState('Koyambedu Wholesale Hub, Chennai');
  const [newDemandBuyerName, setNewDemandBuyerName] = useState('Reliance Retail Fresh Tamil Nadu');
  const [newDemandDate, setNewDemandDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // Stage 2: AI Matching Active Target & Candidate Selection State
  const [selectedDemandIdForMatching, setSelectedDemandIdForMatching] = useState<string>(() => {
    const openDemand = demandRequests.find((d) => d.quantityKg > 0 && d.status !== 'Fulfilled');
    return openDemand ? openDemand.id : (demandRequests[0]?.id || '');
  });
  const [selectedCandidateListingId, setSelectedCandidateListingId] = useState<string>('');

  // Stage 3: FPO Approval Gate Candidate
  const [pendingApprovalMatch, setPendingApprovalMatch] = useState<{
    demand: DemandRequest;
    listing: ProduceListing;
    agreedQty: number;
    agreedPrice: number;
    matchScore: number;
    notes?: string;
  } | null>(null);

  // Stage 5: Collection Modal & Form State
  const [collectionModalOrder, setCollectionModalOrder] = useState<WorkflowOrder | null>(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [collectAmountKg, setCollectAmountKg] = useState<number>(500);
  const [collectionNotes, setCollectionNotes] = useState<string>('Farm gate verification complete; produce weighed & loaded');

  // Stage 6: Quality Inspection Form State
  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState<string | null>(null);
  const [sugarBrix, setSugarBrix] = useState<number>(5.2);
  const [firmness, setFirmness] = useState<number>(3.8);
  const [pesticideTest, setPesticideTest] = useState<'PASS - Organic / ND' | 'PASS - Standard Compliant'>('PASS - Organic / ND');
  const [moisture, setMoisture] = useState<string>('91.5%');
  const [grade, setGrade] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Premium'>('Grade A');
  const [inspectorName, setInspectorName] = useState<string>('Dr. R. Malathi (FPO QA Officer)');
  const [hubLocation, setHubLocation] = useState<string>('Chinnasalem Agro Consolidation Hub');
  const [acceptedKg, setAcceptedKg] = useState<number>(1000);
  const [rejectedKg, setRejectedKg] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Stage 7: Packing Form State
  const [packingModalOrder, setPackingModalOrder] = useState<WorkflowOrder | null>(null);
  const [packQuantityKg, setPackQuantityKg] = useState<number>(1000);
  const [crateType, setCrateType] = useState<string>('Ventilated 25kg Food-Grade Agro-Crates');
  const [packNotes, setPackNotes] = useState<string>('Tamper-evident QR barcode seal attached to all crates');

  // Stage 8: Transport Modal State
  const [transportModalOrder, setTransportModalOrder] = useState<WorkflowOrder | null>(null);
  const [selectedTransportId, setSelectedTransportId] = useState<string>('T1');
  const [vehicleType, setVehicleType] = useState('Tata Ace CoolReefer EV 5.5T (4.2°C Active)');

  // Universal Feedback Message
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  // Operational Stage Filters
  const activeDemands = demandRequests.filter((d) => d.status !== 'Fulfilled' && d.quantityKg > 0);

  const pendingCollectionOrders = orders.filter((o) => {
    if (
      o.status === 'Completed' ||
      o.status === 'Quality Checked' ||
      o.status === 'Quality Rejected' ||
      o.status === 'Packed' ||
      o.status === 'Transport Assigned' ||
      o.status === 'In Transit' ||
      o.status === 'Delivered' ||
      o.status === 'Buyer Confirmed' ||
      o.status === 'Payment Pending'
    ) {
      return false;
    }
    const rem = o.remainingCollectionKg !== undefined ? o.remainingCollectionKg : o.quantityKg;
    return o.status === 'Produce Collection Pending' || o.status === 'Partially Collected' || o.status === 'Created' || rem > 0;
  });

  const approvedFarmerSupplyOrders = orders.filter((o) => {
    return (
      o.status === 'Produce Collection Pending' ||
      o.status === 'Created' ||
      o.status === 'Partially Collected'
    );
  });

  const collectedAwaitingGrading = orders.filter((o) => {
    return (
      (o.status === 'Collected' || (o.collectedQuantityKg && o.collectedQuantityKg > 0 && o.status !== 'Partially Collected')) &&
      o.status !== 'Quality Checked' &&
      o.status !== 'Quality Rejected' &&
      o.status !== 'Packed' &&
      o.status !== 'Transport Assigned' &&
      o.status !== 'In Transit' &&
      o.status !== 'Delivered' &&
      o.status !== 'Buyer Confirmed' &&
      o.status !== 'Payment Pending' &&
      o.status !== 'Completed'
    );
  });

  const gradedAwaitingPacking = orders.filter((o) => {
    return (
      (o.status === 'Quality Checked' || o.qualityStatus === 'Passed' || o.qualityStatus === 'Conditionally Passed') &&
      o.status !== 'Packed' &&
      o.status !== 'Transport Assigned' &&
      o.status !== 'In Transit' &&
      o.status !== 'Delivered' &&
      o.status !== 'Buyer Confirmed' &&
      o.status !== 'Payment Pending' &&
      o.status !== 'Completed' &&
      (o.acceptedQuantityKg === undefined || o.acceptedQuantityKg > 0)
    );
  });

  const packedReadyForLogistics = orders.filter((o) => {
    return (
      o.status === 'Packed' ||
      o.status === 'Transport Assigned' ||
      o.isReadyForTransport === true
    );
  });

  const inTransitOrDeliveredOrders = orders.filter((o) => {
    return (
      o.status === 'In Transit' ||
      o.status === 'Delivered' ||
      o.status === 'Buyer Confirmation Pending' ||
      o.status === 'Buyer Confirmed'
    );
  });

  const settlementPendingOrders = orders.filter((o) => {
    return (
      o.status === 'Payment Pending' ||
      o.status === 'Buyer Confirmed' ||
      o.status === 'Completed' ||
      Boolean(o.settlementId)
    );
  });

  const bulkConsolidatedOrders = orders.filter(
    (o) => o.quantityKg >= 1500 || Boolean(o.aggregatedGroupId) || (o.farmerContributions && o.farmerContributions.length > 1)
  );

  // Active Demand for Stage 2 AI Matching
  const activeMatchingDemand = useMemo(() => {
    return (
      demandRequests.find((d) => d.id === selectedDemandIdForMatching) ||
      demandRequests.find((d) => d.quantityKg > 0 && d.status !== 'Fulfilled') ||
      demandRequests[0]
    );
  }, [demandRequests, selectedDemandIdForMatching]);

  // Stage 2: AI Matching Evaluator
  const evaluatedMatchingCandidates = useMemo(() => {
    if (!activeMatchingDemand) return [];

    return produceListings
      .filter((listing) => listing.quantityKg > 0)
      .map((listing) => {
        const cropMatch =
          listing.crop.toLowerCase().trim() === activeMatchingDemand.crop.toLowerCase().trim();

        // Grade compatibility
        const reqGrade = activeMatchingDemand.qualityRequirement;
        const prodGrade = listing.grade;
        let gradeCompatible = false;
        if (reqGrade === 'Any' || reqGrade === prodGrade) gradeCompatible = true;
        else if (reqGrade === 'Standard' && (prodGrade === 'Grade A' || prodGrade === 'Premium')) gradeCompatible = true;
        else if (reqGrade === 'Grade B' && (prodGrade === 'Grade A' || prodGrade === 'Premium')) gradeCompatible = true;

        // Price comparison
        const priceDiff = activeMatchingDemand.maxTargetPricePerKg - listing.expectedPricePerKg;
        const priceCompatible = priceDiff >= 0;

        // Proximity simulation (deterministic hash from IDs)
        const distanceKm = Math.max(
          8,
          Math.abs(((listing.id.charCodeAt(listing.id.length - 1) * 7) % 45) + 6)
        );

        // Multi-factor score
        let score = 40;
        if (cropMatch) score += 30;
        if (gradeCompatible) score += 15;
        if (priceCompatible) score += 10;
        if (distanceKm < 20) score += 5;

        // Final bounded score
        const totalScore = Math.min(99, Math.max(50, score));

        return {
          listing,
          cropMatch,
          gradeCompatible,
          priceCompatible,
          distanceKm,
          priceDiff,
          totalScore
        };
      })
      .sort((a, b) => {
        if (a.cropMatch !== b.cropMatch) return a.cropMatch ? -1 : 1;
        return b.totalScore - a.totalScore;
      });
  }, [produceListings, activeMatchingDemand]);

  // Handle Demand Creation Submit
  const handleCreateDemandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `DEM-TN-${Math.floor(100 + Math.random() * 900)}`;
    const newDemand: DemandRequest = {
      id: newId,
      buyerId: 'BUYER-INST-01',
      buyerName: newDemandBuyerName,
      buyerType: 'Supermarket',
      crop: newDemandCrop,
      variety: newDemandVariety,
      quantityKg: Number(newDemandQty),
      initialQuantityKg: Number(newDemandQty),
      allocatedQuantityKg: 0,
      qualityRequirement: newDemandGrade,
      location: newDemandLocation,
      deliveryDate: newDemandDate,
      deliveryTimeWindow: '06:00 AM - 09:00 AM',
      maxTargetPricePerKg: Number(newDemandPrice),
      status: 'Created',
      createdAt: new Date().toISOString()
    };

    addDemandRequest(newDemand);
    setShowCreateDemandModal(false);
    setSelectedDemandIdForMatching(newId);
    showNotification(`New Buyer Demand Requirement captured: ${newId} (${newDemandQty.toLocaleString()} kg ${newDemandCrop})`);
    confetti({ particleCount: 30, origin: { y: 0.6 } });
  };

  // Stage 2: Send Match to Stage 3 FPO Approval
  const handleSendToFpoApproval = (
    demand: DemandRequest,
    listing: ProduceListing,
    matchScore: number
  ) => {
    const maxAllocable = Math.min(listing.quantityKg, demand.quantityKg);
    const agreedPrice = listing.expectedPricePerKg || demand.maxTargetPricePerKg;

    setPendingApprovalMatch({
      demand,
      listing,
      agreedQty: maxAllocable,
      agreedPrice,
      matchScore
    });

    setActiveStage('STAGE_3_APPROVAL');
    showNotification(`AI Match for ${demand.id} submitted to FPO Governing Approval Gate.`);
  };

  // Stage 3: FPO Authorizes & Locks Match
  const handleApproveMatchSubmit = async () => {
    if (!pendingApprovalMatch) return;

    const { listing, demand, agreedPrice, agreedQty } = pendingApprovalMatch;

    const order = await confirmMatchAndCreateOrder(
      listing.id,
      demand.id,
      agreedPrice,
      agreedQty
    );

    if (order) {
      confetti({ particleCount: 60, origin: { y: 0.6 } });
      showNotification(
        `FPO APPROVED: Demand-driven contract issued! Order ${order.id} generated. ${agreedQty.toLocaleString()} kg locked to approved farmer ${listing.farmerName}.`
      );
      setPendingApprovalMatch(null);
      setActiveStage('STAGE_4_FARMER_SUPPLY');
    }
  };

  // Stage 5: Collection Modal Handlers
  const handleOpenCollectionModal = (order: WorkflowOrder) => {
    setCollectionModalOrder(order);
    const contributions = order.farmerContributions || [];
    const pendingContrib = contributions.find((c) => c.collectionStatus !== 'FULLY_COLLECTED') || contributions[0];
    const farmerId = pendingContrib ? pendingContrib.farmerId : order.farmerId;
    setSelectedFarmerId(farmerId);
    const maxRem = pendingContrib
      ? Math.max(0, pendingContrib.contributedQuantityKg - (pendingContrib.collectedQuantityKg || 0))
      : (order.remainingCollectionKg || order.quantityKg);
    setCollectAmountKg(maxRem);
  };

  const handleRecordCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionModalOrder) return;

    const res = fpoRecordCollection(
      collectionModalOrder.id,
      selectedFarmerId,
      Number(collectAmountKg),
      collectionNotes
    );
    if (res) {
      showNotification(
        `Farm gate collection of ${Number(collectAmountKg).toLocaleString()} kg recorded for Order ${collectionModalOrder.id}!`
      );
      confetti({ particleCount: 35, origin: { y: 0.6 } });
      setCollectionModalOrder(null);
      setActiveStage('STAGE_6_QUALITY');
    }
  };

  // Stage 6: Quality Inspection Handlers
  const handleStartInspection = (order: WorkflowOrder) => {
    setSelectedOrderForInspection(order.id);
    const totalCollected = order.collectedQuantityKg || order.quantityKg;
    setAcceptedKg(totalCollected);
    setRejectedKg(0);
    setRejectionReason('');
  };

  const handleSaveInspection = (orderId: string) => {
    const totalCollected = orders.find((o) => o.id === orderId)?.collectedQuantityKg || 1000;
    const validatedAccepted = Math.min(totalCollected, Math.max(0, Number(acceptedKg)));
    const validatedRejected = Math.max(0, totalCollected - validatedAccepted);

    const metrics: QualityInspectionData = {
      sugarBrix: Number(sugarBrix),
      firmnessKgCm: Number(firmness),
      pesticideResidueTest: pesticideTest,
      moistureContent: moisture,
      verifiedGrade: grade,
      inspectorName,
      inspectionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      hubLocation,
      status: validatedAccepted <= 0 ? 'REJECTED' : (validatedRejected > 0 ? 'CONDITIONALLY_PASSED' : 'PASSED'),
      acceptedQuantityKg: validatedAccepted,
      rejectedQuantityKg: validatedRejected,
      rejectionReason: validatedRejected > 0 ? rejectionReason || 'Surface sizing variation' : undefined,
      inspectionNotes: `Inspected at ${hubLocation} by ${inspectorName}. Brix: ${sugarBrix}°, Firmness: ${firmness} kg/cm²`
    };

    fpoRecordQualityGrading(orderId, metrics);
    setSelectedOrderForInspection(null);
    showNotification(
      `Quality check certified for Order ${orderId}: ${validatedAccepted.toLocaleString()} kg ACCEPTED (${grade}), ${validatedRejected.toLocaleString()} kg rejected.`
    );
    confetti({ particleCount: 40, origin: { y: 0.6 } });
    setActiveStage('STAGE_7_PACKING');
  };

  // Stage 7: Packing Handlers
  const handleOpenPackingModal = (order: WorkflowOrder) => {
    setPackingModalOrder(order);
    const packable = order.acceptedQuantityKg !== undefined ? order.acceptedQuantityKg : (order.collectedQuantityKg || order.quantityKg);
    setPackQuantityKg(packable);
  };

  const handleRecordPackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packingModalOrder) return;

    const crates = Math.ceil(packQuantityKg / 25);
    fpoRecordPacking(packingModalOrder.id, {
      packedQuantityKg: Number(packQuantityKg),
      packageType: crateType,
      crateCount: crates,
      notes: `${packNotes} (${crates} crates @ 25kg/crate)`
    });

    setPackingModalOrder(null);
    showNotification(
      `Order ${packingModalOrder.id} crated into ${crates} units with QR seal! Transport readiness unlocked.`
    );
    confetti({ particleCount: 50, origin: { y: 0.6 } });
    setActiveStage('STAGE_8_TRANSPORT');
  };

  // Stage 8: Transport Handlers
  const handleOpenTransportModal = (order: WorkflowOrder) => {
    setTransportModalOrder(order);
  };

  const handleDispatchTransportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transportModalOrder) return;

    const selectedTransport = AVAILABLE_TRANSPORTS.find(t => t.id === selectedTransportId) || AVAILABLE_TRANSPORTS[0];

    const assignment: TransportAssignment = {
      carrierName: selectedTransport.carrierName,
      vehicleNumber: selectedTransport.vehicleNumber,
      driverName: selectedTransport.driverName,
      driverPhone: selectedTransport.driverPhone,
      vehicleType: selectedTransport.vehicleType,
      assignedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      departureTime: 'Immediate',
      estimatedArrival: 'In 3.5 hrs (NH-48 Cold Corridor)',
      temperatureC: '4.2°C'
    };

    assignTransport(transportModalOrder.id, assignment);
    setTransportModalOrder(null);
    showNotification(
      `Order ${transportModalOrder.id} assigned to ${selectedTransport.carrierName} (${selectedTransport.vehicleNumber}). Awaiting carrier dispatch.`
    );
    confetti({ particleCount: 40, origin: { y: 0.6 } });
  };

  // Stage 9: Buyer Delivery Receipt Sign-off
  const handleBuyerDeliverySignoff = (orderId: string) => {
    buyerConfirmReceipt(orderId);
    showNotification(`Buyer inspection complete: Produce accepted and delivery receipt verified for Order ${orderId}! Escrow payout queued.`);
    confetti({ particleCount: 45, origin: { y: 0.6 } });
    setActiveStage('STAGE_10_PAYMENT');
  };

  // Stage 10: Escrow Settlement Handler
  const handleExecuteSettlement = (orderId: string) => {
    recordBuyerPayment(orderId, {
      reference: `UPI-ERUPI-${Math.floor(100000 + Math.random() * 900000)}`,
      method: 'RBI e-RUPI Programmable Smart Escrow'
    });
    processFpoSettlement(orderId);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    showNotification(`Transaction Settled: 89% farmer payout disbursed via e-RUPI instant settlement for Order ${orderId}!`);
  };

  // 10-Step Pipeline Definition
  const WORKFLOW_STEPS = [
    {
      id: 'STAGE_1_DEMAND' as const,
      stepNum: '1',
      title: t('fpo.step1Title', 'Buyer Demand'),
      subtitle: t('fpo.step1Sub', 'Contracted Requirements'),
      icon: ShoppingCart,
      badgeCount: activeDemands.length,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'STAGE_2_MATCHING' as const,
      stepNum: '2',
      title: t('fpo.step2Title', 'AI Matching'),
      subtitle: t('fpo.step2Sub', 'Proximity & Quality Engine'),
      icon: Sparkles,
      badgeCount: evaluatedMatchingCandidates.length,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'STAGE_3_APPROVAL' as const,
      stepNum: '3',
      title: t('fpo.step3Title', 'FPO Approval'),
      subtitle: t('fpo.step3Sub', 'Governing Contract Gate'),
      icon: Award,
      badgeCount: pendingApprovalMatch ? 1 : 0,
      badgeColor: pendingApprovalMatch ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-slate-100 text-slate-700'
    },
    {
      id: 'STAGE_4_FARMER_SUPPLY' as const,
      stepNum: '4',
      title: t('fpo.step4Title', 'Farmer Supply'),
      subtitle: t('fpo.step4Sub', 'Approved Member Quotas'),
      icon: Sprout,
      badgeCount: approvedFarmerSupplyOrders.length,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'STAGE_5_COLLECTION' as const,
      stepNum: '5',
      title: t('fpo.step5Title', 'Collection'),
      subtitle: t('fpo.step5Sub', 'Farm Gate Weighing'),
      icon: Package,
      badgeCount: pendingCollectionOrders.length,
      badgeColor: pendingCollectionOrders.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
    },
    {
      id: 'STAGE_6_QUALITY' as const,
      stepNum: '6',
      title: t('fpo.step6Title', 'Quality Check'),
      subtitle: t('fpo.step6Sub', 'Sugar Brix & Pesticide QA'),
      icon: ShieldCheck,
      badgeCount: collectedAwaitingGrading.length,
      badgeColor: collectedAwaitingGrading.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
    },
    {
      id: 'STAGE_7_PACKING' as const,
      stepNum: '7',
      title: t('fpo.step7Title', 'Packing & QR'),
      subtitle: t('fpo.step7Sub', 'Agro-Crates & Passport Seal'),
      icon: QrCode,
      badgeCount: gradedAwaitingPacking.length,
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'STAGE_8_TRANSPORT' as const,
      stepNum: '8',
      title: t('fpo.step8Title', 'Transport'),
      subtitle: t('fpo.step8Sub', 'Cold-Chain Reefer Dispatch'),
      icon: Truck,
      badgeCount: packedReadyForLogistics.length,
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'STAGE_9_DELIVERY' as const,
      stepNum: '9',
      title: t('fpo.step9Title', 'Delivery'),
      subtitle: t('fpo.step9Sub', 'Buyer Facility Sign-off'),
      icon: MapPin,
      badgeCount: inTransitOrDeliveredOrders.length,
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    {
      id: 'STAGE_10_PAYMENT' as const,
      stepNum: '10',
      title: t('fpo.step10Title', 'Payment'),
      subtitle: t('fpo.step10Sub', '89% Farmer Realization'),
      icon: IndianRupee,
      badgeCount: settlementPendingOrders.length,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* ── HEADER BANNER ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-emerald-500/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccd5ae]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#ccd5ae] text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>{t('fpo.hubFacility', 'FPO Aggregator & Regional Micro-Hub Facility')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {currentUser.organization || 'Uzhavan GreenHarvest FPO Federation'}
          </h1>
          <p className="text-sm text-white/85 mt-2 max-w-2xl font-normal">
            {t(
              'fpo.hubSubtitleFull',
              'End-to-End Demand-Driven Procurement: Connecting institutional buyer contracts with smallholder farm supply across 10 transparent, traceable stages.'
            )}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateDemandModal(true)}
            className="flex items-center gap-2 bg-[#e9edc9] hover:bg-[#fefae0] text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-sm transition tracking-wide cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('fpo.captureNewDemand', 'Capture Buyer Demand')}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-5 py-3 rounded-2xl border border-white/20 shadow-sm transition cursor-pointer"
          >
            <span>{t('fpo.allOrdersCount', 'Orders Ledger ({{count}})', { count: orders.length })}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>



      {/* ── ACTION NOTIFICATION BANNER ────────────────────────────────────────── */}
      {actionSuccessMessage && (
        <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-[#01472e] text-white flex items-center justify-center font-medium text-sm shrink-0">
            ✓
          </div>
          <p className="text-xs font-semibold text-[#01472e]">{actionSuccessMessage}</p>
        </div>
      )}

      {/* Upcoming Tasks Widget */}
      <UpcomingTasksWidget limit={5} />

      {/* ── PRODUCE QUALITY & BUYER FEEDBACK CENTER ────────────────────────── */}
      <div className="rounded-[32px] border border-[#a3b18a]/40 bg-white/95 backdrop-blur-md shadow-soft p-6 sm:p-8 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#ccd5ae]/30 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#01472e] to-[#025a3b] flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-[#e9edc9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#01472e] tracking-tight">
                  {t('fpo.reviews.title', 'Produce Quality & Buyer Reviews Center')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {t('fpo.reviews.liveSync', '● Live Sync')}
                </span>
              </div>
              <p className="text-xs text-[#5c7065] mt-1">
                {t('fpo.reviews.subtitle', 'Produce quality benchmarks and reviews gathered from institutional buyer feedback, hub quality audits, and receiving dock reports.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setActiveTab('hub-feedback')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#01472e] text-white text-xs font-semibold hover:bg-[#025a3b] transition cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t('fpo.reviews.fullConsole', 'Full Feedback Console')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveTab('you-said-we-improved')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#ccd5ae]/60 text-[#01472e] text-xs font-semibold hover:bg-[#eaf4ec] transition cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('fpo.reviews.publicImprovements', 'Public Improvements')}</span>
            </button>
          </div>
        </div>

        {/* Quality Health Scorecard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7065]">{t('fpo.reviews.avgQuality', 'Avg Produce Quality')}</span>
              <div className="flex text-amber-400 text-xs">★★★★★</div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-[#01472e]">4.8</span>
              <span className="text-xs font-medium text-[#5c7065]"> / 5.0</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold mt-1">
              {t('fpo.reviews.positiveSentiment', '94% positive sentiment across 87 reviews')}
            </p>
          </div>

          <div className="bg-white border border-[#ccd5ae]/50 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7065]">{t('fpo.reviews.gradingAccuracy', 'Grading Accuracy')}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-[#01472e]">97.4%</span>
            </div>
            <p className="text-[10px] text-[#5c7065] font-medium mt-1">
              Calibrated mechanical sorting tables active
            </p>
          </div>

          <div className="bg-white border border-[#ccd5ae]/50 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7065]">{t('fpo.reviews.weighingTransparency', 'Weighing Transparency')}</span>
              <Scale className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-[#01472e]">99.1%</span>
            </div>
            <p className="text-[10px] text-[#5c7065] font-medium mt-1">
              {t('fpo.reviews.tareWeightDisputes', 'Zero tare weight disputes this week')}
            </p>
          </div>

          <div className="bg-white border border-[#ccd5ae]/50 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7065]">{t('fpo.reviews.coldChainFreshness', 'Cold-Chain Freshness')}</span>
              <Truck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-[#01472e]">96.8%</span>
            </div>
            <p className="text-[10px] text-[#5c7065] font-medium mt-1">
              {t('fpo.reviews.avgDispatchTemp', 'Avg dispatch temp maintained at 4.2°C')}
            </p>
          </div>
        </div>

        {/* Recent Buyer Quality Feedback on FPO Lots */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#01472e]" />
              <h3 className="text-xs font-bold text-[#01472e] uppercase tracking-wider">
                {t('fpo.reviews.recentFeedback', 'Recent Buyer Feedback on FPO Batches')}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('hub-feedback')}
              className="text-xs font-semibold text-[#01472e] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View all {((feedbackItems || []).length || 20)} reviews</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(feedbackItems || [])
              .filter((f) => f.feedbackType === 'feedback' || f.ratings?.quality)
              .slice(0, 3)
              .map((f) => (
                <div key={f.feedbackId} className="bg-[#faf9f5] border border-[#ccd5ae]/40 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#01472e] truncate">{f.productName || 'Fresh Produce'}</span>
                    <span className="text-[10px] font-mono text-[#788c80]">#{f.feedbackId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= (f.ratings?.quality || f.ratings?.overall || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-bold text-[#01472e] ml-1">
                      {f.ratings?.quality || f.ratings?.overall || 5}.0
                    </span>
                  </div>
                  <p className="text-xs text-[#5c7065] line-clamp-2 leading-snug italic">
                    "{f.comment || 'Produce arrived in excellent condition with high freshness.'}"
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#ccd5ae]/30 text-[10px] text-[#788c80]">
                    <span>{f.buyerName || 'Verified Buyer'}</span>
                    <span>{f.farmerName ? `🌾 ${f.farmerName}` : 'FPO Lot'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ── 10-STEP DEMAND-DRIVEN WORKFLOW INTERACTIVE PIPELINE STEPPER ───────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#01472e]" />
            <h2 className="text-sm font-semibold text-[#01472e] uppercase tracking-wider">
              10-Stage Demand-Driven Fulfillment Workflow
            </h2>
          </div>
          <span className="text-xs text-[#01472e]/70">
            Click any step to inspect and advance operations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = activeStage === step.id;
            return (
              <button
                key={step.id}
                onClick={() => handleSetStage(step.id as WorkflowStageKey)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#01472e] text-white border-[#01472e] shadow-md ring-2 ring-[#01472e]/20'
                    : 'bg-white hover:bg-[#eaf4ec] text-[#01472e] border-[#ccd5ae]/40 hover:border-[#a3b18a]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {step.stepNum}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e9edc9]' : 'text-[#a3b18a]'}`} />
                  </div>
                  <p className="text-xs font-semibold truncate">{step.title}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#e9edc9] text-[#01472e]' : step.badgeColor
                    }`}
                  >
                    {step.badgeCount}
                  </span>
                  <ChevronRight className={`w-3 h-3 ${isActive ? 'text-white/60' : 'text-slate-300'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── COMPLEMENTARY SUB-VIEWS TAB TOGGLE ────────────────────────────────── */}
      <div className="flex gap-2 border-b border-[#ccd5ae]/30 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => handleSetStage('STAGE_1_DEMAND')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer ${
            activeStage.startsWith('STAGE_')
              ? 'bg-[#01472e] text-white'
              : 'bg-white text-[#01472e]/70 border border-[#ccd5ae]/40 hover:bg-[#eaf4ec]'
          }`}
        >
          {t('fpo.tab.10StepFlow', 'Demand-Driven 10-Step Workflow')}
        </button>
        <button
          onClick={() => handleSetStage('MEMBER_SUPPLY')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer ${
            activeStage === 'MEMBER_SUPPLY'
              ? 'bg-[#01472e] text-white'
              : 'bg-white text-[#01472e]/70 border border-[#ccd5ae]/40 hover:bg-[#eaf4ec]'
          }`}
        >
          {t('fpo.tab.memberSupplyPool', 'Member Supply Pool ({{count}})', { count: produceListings.length })}
        </button>
        <button
          onClick={() => handleSetStage('CONSOLIDATION')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer ${
            activeStage === 'CONSOLIDATION'
              ? 'bg-[#01472e] text-white'
              : 'bg-white text-[#01472e]/70 border border-[#ccd5ae]/40 hover:bg-[#eaf4ec]'
          }`}
        >
          {t('fpo.tab.bulkConsolidation', 'Bulk Consolidation Hub ({{count}})', { count: bulkConsolidatedOrders.length })}
        </button>
        <button
          onClick={() => handleSetStage('ALL')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer ${
            activeStage === 'ALL'
              ? 'bg-[#01472e] text-white'
              : 'bg-white text-[#01472e]/70 border border-[#ccd5ae]/40 hover:bg-[#eaf4ec]'
          }`}
        >
          {t('fpo.tab.allOrdersLedger', 'All Collective Batches ({{count}})', { count: orders.length })}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 1: BUYER DEMAND CAPTURE & REQUIREMENTS ────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_1_DEMAND' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 1: Contracted Institutional Buyer Demand Requirements
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Every procurement cycle begins with a confirmed buyer requirement. Produce is collected only to satisfy active demand contracts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                {activeDemands.length} Active Purchase Contracts
              </span>
              <button
                onClick={() => setShowCreateDemandModal(true)}
                className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contract</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {demandRequests.map((demand) => {
              const initial = demand.initialQuantityKg || demand.quantityKg;
              const remaining = demand.quantityKg;
              const allocated = demand.allocatedQuantityKg || Math.max(0, initial - remaining);
              const percentFulfilled = initial > 0 ? Math.round((allocated / initial) * 100) : 0;
              const isSelectedForMatch = selectedDemandIdForMatching === demand.id;

              return (
                <div
                  key={demand.id}
                  className={`p-5 border rounded-2xl space-y-3.5 transition shadow-xs flex flex-col justify-between ${
                    isSelectedForMatch
                      ? 'border-[#01472e] bg-[#f7faf7] ring-1 ring-[#01472e]/30'
                      : 'border-[#ccd5ae]/40 bg-[#faf9f5] hover:border-[#a3b18a]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#01472e]">{demand.id}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          demand.status === 'Fulfilled'
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {demand.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <img src={getCropImageUrl(demand.crop)} alt={demand.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                        <h4 className="font-semibold text-[#01472e] text-sm">
                          {t(`crops.${demand.crop}`, demand.crop)}
                          {demand.variety && <span className="text-[#01472e]/60 font-normal ml-1">({demand.variety})</span>}
                        </h4>
                      </div>
                      <p className="text-xs text-[#01472e]/80 mt-0.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#a3b18a]" />
                        <span>Buyer: <strong className="text-[#01472e]">{demand.buyerName}</strong></span>
                      </p>
                      <p className="text-[11px] text-[#01472e]/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#a3b18a]" />
                        <span>{demand.location}</span>
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#ccd5ae]/30 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#01472e]/70">Required Volume:</span>
                        <strong className="font-mono text-[#01472e]">{remaining.toLocaleString()} kg remaining</strong>
                      </div>
                      <div className="w-full bg-[#e9edc9]/50 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#01472e] h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentFulfilled}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#01472e]/60 font-mono">
                        <span>Target: ₹{demand.maxTargetPricePerKg}/kg</span>
                        <span>Spec: {demand.qualityRequirement}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#01472e]/70 space-y-0.5 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#a3b18a]" />
                        <span>Delivery By: <strong className="text-[#01472e]">{demand.deliveryDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#a3b18a]" />
                        <span>Receiving Window: {demand.deliveryTimeWindow || 'Morning 06:00 - 09:00'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#01472e]">
                      Total: ₹{(demand.quantityKg * demand.maxTargetPricePerKg).toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDemandIdForMatching(demand.id);
                        setActiveStage('STAGE_2_MATCHING');
                      }}
                      className="btn-primary text-xs py-2 px-3.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#ccd5ae]" />
                      <span>Run AI Match →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 2: AI FARMER MATCHING ENGINE ───────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_2_MATCHING' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 2: Algorithmic AI Farmer Matching Engine
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                AI matches confirmed buyer demand with available FPO member farmers based on harvest schedule, geographic proximity, certified quality, and price compatibility.
              </p>
            </div>

            {/* Target Demand Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#01472e]/70">Target Contract:</span>
              <select
                value={selectedDemandIdForMatching}
                onChange={(e) => setSelectedDemandIdForMatching(e.target.value)}
                className="input-modern text-xs py-2 px-3 font-semibold text-[#01472e]"
              >
                {demandRequests.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} — {d.crop} ({d.quantityKg.toLocaleString()} kg @ ₹{d.maxTargetPricePerKg}/kg)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Demand Target Card */}
          {activeMatchingDemand && (
            <div className="p-4.5 bg-white border border-[#ccd5ae]/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#01472e] bg-[#eaf4ec] px-2.5 py-0.5 rounded-md border border-[#a3b18a]/40">
                    {activeMatchingDemand.id}
                  </span>
                  <span className="text-xs font-semibold text-[#01472e]">{activeMatchingDemand.buyerName}</span>
                </div>
                <h4 className="text-base font-bold text-[#01472e] flex items-center gap-2">
                  <img src={getCropImageUrl(activeMatchingDemand.crop)} alt={activeMatchingDemand.crop} className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                  <span>Procuring {activeMatchingDemand.quantityKg.toLocaleString()} kg of {activeMatchingDemand.crop} ({activeMatchingDemand.variety || 'Hybrid'})</span>
                </h4>
                <p className="text-xs text-[#01472e]/70">
                  Required Grade: <strong className="text-[#01472e]">{activeMatchingDemand.qualityRequirement}</strong> • Max Price: <strong className="text-[#01472e]">₹{activeMatchingDemand.maxTargetPricePerKg}/kg</strong> • Delivery: {activeMatchingDemand.location}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-[#01472e]/70 block">Total Contract Budget</span>
                <strong className="text-xl font-bold font-mono text-[#01472e]">
                  ₹{(activeMatchingDemand.quantityKg * activeMatchingDemand.maxTargetPricePerKg).toLocaleString()}
                </strong>
              </div>
            </div>
          )}

          {/* AI Evaluated Candidates List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#01472e] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#01472e]" />
                <span>Member Farmer Matches ({evaluatedMatchingCandidates.length} Evaluated)</span>
              </h4>
              <span className="text-xs text-[#01472e]/60">Ranked by Proximity & Spec Compatibility</span>
            </div>

            {evaluatedMatchingCandidates.length === 0 ? (
              <div className="py-12 text-center text-[#01472e]/50 border border-dashed rounded-2xl">
                <p className="text-sm font-semibold">No member produce listings currently available for this crop.</p>
                <p className="text-xs mt-1">Submit member harvest listings under Member Supply Pool.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluatedMatchingCandidates.map((candidate, idx) => {
                  const { listing, totalScore, distanceKm, priceDiff, cropMatch, gradeCompatible, priceCompatible } = candidate;
                  const isTopMatch = idx === 0;

                  return (
                    <div
                      key={listing.id}
                      className={`p-5 rounded-2xl border transition shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isTopMatch
                          ? 'bg-[#f7faf7] border-[#01472e] ring-1 ring-[#01472e]/20'
                          : 'bg-white border-[#ccd5ae]/40 hover:border-[#a3b18a]'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#01472e]">{listing.id}</span>
                          <span className="text-[#ccd5ae]">•</span>
                          <strong className="text-sm text-[#01472e]">{listing.farmerName}</strong>
                          <span className="text-xs text-[#01472e]/60">({listing.location})</span>

                          {isTopMatch && (
                            <span className="text-[10px] font-bold bg-[#01472e] text-white px-2.5 py-0.5 rounded-full">
                              ★ Optimal Proximity & Grade Match
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#01472e]/80">
                          <span>
                            Available Supply: <strong className="font-mono text-[#01472e]">{listing.quantityKg.toLocaleString()} kg</strong>
                          </span>
                          <span>
                            Expected Price: <strong className="font-mono text-[#01472e]">₹{listing.expectedPricePerKg}/kg</strong>
                          </span>
                          <span>
                            Grade: <strong className="text-[#01472e]">{listing.grade}</strong>
                          </span>
                        </div>

                        {/* Multi-Factor Scoring Pills */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#eaf4ec] text-[#01472e] font-semibold border border-[#a3b18a]/30">
                            Proximity: {distanceKm} km
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-semibold border ${
                              priceCompatible
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {priceDiff >= 0 ? `₹${priceDiff}/kg under budget` : `₹${Math.abs(priceDiff)}/kg above target`}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-semibold border ${
                              gradeCompatible
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {gradeCompatible ? 'Quality Compatible' : 'Grade Mismatch'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                            Wastage Mitigation: -26%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end lg:self-center shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-[#01472e]/70 uppercase font-semibold block">AI Match Score</span>
                          <span className="text-2xl font-bold font-mono text-[#01472e]">{totalScore}%</span>
                        </div>

                        <button
                          onClick={() => handleSendToFpoApproval(activeMatchingDemand, listing, totalScore)}
                          className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-[#ccd5ae]" />
                          <span>Submit to FPO Approval →</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 3: FPO GOVERNING REVIEW & APPROVAL GATE ─────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_3_APPROVAL' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 3: FPO Governing Review & Approval Gate
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                The FPO board reviews the AI match terms, confirms member farmer quota authorization, and legally issues the demand-backed supply contract.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              Operational Gate: 100% Demand-Backed
            </span>
          </div>

          {!pendingApprovalMatch ? (
            <div className="py-12 text-center text-[#01472e]/50 border border-dashed rounded-2xl space-y-3">
              <Award className="w-10 h-10 mx-auto text-[#01472e] opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">No candidate match currently staged for approval.</p>
              <p className="text-xs text-[#01472e]/60">Select an active demand in Stage 2 to run AI matching and submit for approval.</p>
              <button
                onClick={() => setActiveStage('STAGE_2_MATCHING')}
                className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Go to Stage 2 AI Matching</span>
              </button>
            </div>
          ) : (
            <div className="p-6 bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-2xl space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
                <span className="text-xs font-bold uppercase tracking-wider text-[#01472e] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#01472e]" />
                  <span>Pending FPO Governing Signoff — Match Score: {pendingApprovalMatch.matchScore}%</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#01472e] bg-white px-3 py-1 rounded-full border border-[#ccd5ae]/50">
                  Target Contract: {pendingApprovalMatch.demand.id}
                </span>
              </div>

              {/* Demand vs Supply Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Demand Side */}
                <div className="p-4 bg-white rounded-xl border border-[#ccd5ae]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#01472e] uppercase text-[11px]">Buyer Requirement</span>
                    <span className="font-mono text-[#01472e] font-semibold">{pendingApprovalMatch.demand.id}</span>
                  </div>
                  <p className="font-semibold text-[#01472e] text-sm">{pendingApprovalMatch.demand.buyerName}</p>
                  <div className="space-y-1 text-[#01472e]/80">
                    <p>Crop: <strong>{pendingApprovalMatch.demand.crop}</strong> ({pendingApprovalMatch.demand.variety || 'Hybrid'})</p>
                    <p>Required Grade: <strong>{pendingApprovalMatch.demand.qualityRequirement}</strong></p>
                    <p>Destination: <strong>{pendingApprovalMatch.demand.location}</strong></p>
                    <p>Max Target Price: <strong>₹{pendingApprovalMatch.demand.maxTargetPricePerKg}/kg</strong></p>
                  </div>
                </div>

                {/* Farmer Supply Side */}
                <div className="p-4 bg-white rounded-xl border border-[#ccd5ae]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#01472e] uppercase text-[11px]">Approved Member Farmer</span>
                    <span className="font-mono text-[#01472e] font-semibold">{pendingApprovalMatch.listing.id}</span>
                  </div>
                  <p className="font-semibold text-[#01472e] text-sm">{pendingApprovalMatch.listing.farmerName}</p>
                  <div className="space-y-1 text-[#01472e]/80">
                    <p>Crop: <strong>{pendingApprovalMatch.listing.crop}</strong></p>
                    <p>Farm Location: <strong>{pendingApprovalMatch.listing.location}</strong></p>
                    <p>Certified Grade: <strong>{pendingApprovalMatch.listing.grade}</strong></p>
                    <p>Available Supply: <strong>{pendingApprovalMatch.listing.quantityKg.toLocaleString()} kg</strong></p>
                  </div>
                </div>
              </div>

              {/* Financial & Realization Breakdown */}
              <div className="p-4 bg-[#eaf4ec] rounded-xl border border-[#a3b18a]/40 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#01472e]">
                  Financial Agreement & Transparent Escrow Breakdown
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#01472e]/70 block">Agreed Volume</span>
                    <strong className="text-sm font-mono text-[#01472e]">
                      {pendingApprovalMatch.agreedQty.toLocaleString()} kg
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#01472e]/70 block">Agreed Price</span>
                    <strong className="text-sm font-mono text-[#01472e]">
                      ₹{pendingApprovalMatch.agreedPrice}/kg
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#01472e]/70 block">Total Contract Value</span>
                    <strong className="text-sm font-mono text-[#01472e]">
                      ₹{(pendingApprovalMatch.agreedQty * pendingApprovalMatch.agreedPrice).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#01472e]/70 block">Guaranteed Farmer Share (89%)</span>
                    <strong className="text-sm font-mono text-emerald-800">
                      ₹{Math.round(pendingApprovalMatch.agreedQty * pendingApprovalMatch.agreedPrice * 0.89).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="text-[11px] text-[#01472e]/70 pt-2 border-t border-[#a3b18a]/30">
                  Escrow distribution model: 89% Farmer net realization, 8% cold-chain logistics, 3% FPO platform operations. Direct demand linkage eliminates middlemen commissions and post-harvest storage depreciation.
                </div>
              </div>

              {/* FPO Decision Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  onClick={() => setPendingApprovalMatch(null)}
                  className="px-4 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
                >
                  Reject Match & Return to Stage 2
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleApproveMatchSubmit}
                    className="btn-primary text-xs py-3 px-6 rounded-2xl flex items-center gap-2 shadow-md cursor-pointer font-bold"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Match & Lock Quota (Issue Contract)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 4: FARMER SUPPLY MANAGEMENT ────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_4_FARMER_SUPPLY' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 4: Approved Member Farmer Supply Allocation
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Demand-Driven Core Principle: Only approved farmers with confirmed contracts supply produce. Uncontracted produce is never collected speculatively.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              {approvedFarmerSupplyOrders.length} Contracted Supply Batches
            </span>
          </div>

          {approvedFarmerSupplyOrders.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/50 border border-dashed rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#01472e] opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">No active supply orders awaiting harvest pickup.</p>
              <p className="text-xs text-[#01472e]/60">Approve AI matches in Stage 3 to allocate member farmer supply quotas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {approvedFarmerSupplyOrders.map((order) => {
                const contributions = order.farmerContributions || [
                  {
                    farmerId: order.farmerId,
                    farmerName: order.farmerName,
                    farmerLocation: order.farmerLocation,
                    produceListingId: order.produceListingId,
                    contributedQuantityKg: order.quantityKg,
                    collectedQuantityKg: order.collectedQuantityKg || 0,
                    collectionStatus: 'PENDING'
                  }
                ];

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#01472e]">{order.id}</span>
                        <span className="text-[#ccd5ae]">•</span>
                        <span className="font-mono text-xs text-[#01472e]/70">{order.batchId}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Approved for Supply
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                        <h4 className="font-bold text-sm text-[#01472e]">
                          {t(`crops.${order.crop}`, order.crop)} ({order.variety || 'Hybrid'})
                        </h4>
                      </div>
                      <p className="text-xs text-[#01472e]/80 mt-0.5">
                        Contracted Buyer: <strong className="text-[#01472e]">{order.buyerName}</strong> ({order.deliveryLocation})
                      </p>
                    </div>

                    {/* Contributing Farmers Details */}
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#ccd5ae]/30">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#01472e]/70">
                        Authorized Farmer Sources ({contributions.length})
                      </p>
                      {contributions.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-[#01472e]">{c.farmerName}</p>
                            <p className="text-[10px] text-[#01472e]/60">{c.farmerLocation}</p>
                          </div>
                          <span className="font-mono font-bold text-[#01472e]">
                            {c.contributedQuantityKg.toLocaleString()} kg quota
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between text-xs">
                      <span className="font-mono text-[#01472e] font-semibold">
                        Value: ₹{order.totalValue.toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          setActiveStage('STAGE_5_COLLECTION');
                          handleOpenCollectionModal(order);
                        }}
                        className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Schedule Farm Gate Pickup →</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 5: FARM GATE PRODUCE COLLECTION ────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_5_COLLECTION' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 5: Farm Gate Produce Collection Queue
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Collect harvested produce strictly from authorized member farms. Multi-farmer contributions and partial pickups maintain complete origin provenance.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              {pendingCollectionOrders.length} Orders Awaiting Collection
            </span>
          </div>

          {pendingCollectionOrders.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">All contracted member farm produce collected!</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">Batches are now advancing to Stage 6 Quality Inspection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {pendingCollectionOrders.map((order) => {
                const requiredKg = order.quantityKg;
                const collectedKg = order.collectedQuantityKg || 0;
                const remainingKg = order.remainingCollectionKg !== undefined ? order.remainingCollectionKg : (requiredKg - collectedKg);
                const percentCollected = requiredKg > 0 ? Math.round((collectedKg / requiredKg) * 100) : 0;
                const contributions = order.farmerContributions || [
                  {
                    farmerId: order.farmerId,
                    farmerName: order.farmerName,
                    farmerLocation: order.farmerLocation,
                    produceListingId: order.produceListingId,
                    contributedQuantityKg: order.quantityKg,
                    collectedQuantityKg: collectedKg,
                    collectionStatus: percentCollected >= 100 ? 'FULLY_COLLECTED' : 'PENDING'
                  }
                ];

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                        <span className="text-[#ccd5ae]">•</span>
                        <span className="font-mono text-[11px] text-[#01472e]/70 font-semibold">{order.batchId}</span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40">
                        {order.status === 'Partially Collected' ? 'Partially Collected' : 'Collection Pending'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                        <h4 className="font-semibold text-[#01472e] text-sm">{t(`crops.${order.crop}`, order.crop)} ({order.variety || 'Hybrid'})</h4>
                      </div>
                      <p className="text-xs text-[#01472e]/70 mt-0.5">
                        Buyer: <strong className="text-[#01472e]">{order.buyerName}</strong> ({order.deliveryLocation})
                      </p>
                    </div>

                    <div className="bg-white/80 p-3.5 rounded-xl border border-[#ccd5ae]/30 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#01472e]/70 font-medium">Collection Progress:</span>
                        <span className="font-semibold text-[#01472e] font-mono">
                          {collectedKg.toLocaleString()} / {requiredKg.toLocaleString()} kg ({percentCollected}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#e9edc9]/50 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#01472e] h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentCollected}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[#01472e]/70 font-mono pt-0.5">
                        <span className="text-[#01472e] font-semibold">Collected: {collectedKg.toLocaleString()} kg</span>
                        <span className="text-amber-800 font-medium">Remaining: {remainingKg.toLocaleString()} kg</span>
                      </div>
                    </div>

                    {/* Contributing Farmers */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#01472e]/70 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#a3b18a]" />
                        <span>Contributing Farmer Sources ({contributions.length})</span>
                      </p>
                      <div className="space-y-1.5">
                        {contributions.map((c, idx) => (
                          <div key={idx} className="p-3 bg-white border border-[#ccd5ae]/30 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-[#01472e]">{c.farmerName}</p>
                              <p className="text-[11px] text-[#01472e]/60">{c.farmerLocation}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-semibold text-[#01472e] block">
                                {c.collectedQuantityKg || 0} / {c.contributedQuantityKg} kg
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between">
                      <span className="text-[11px] text-[#01472e]/70 font-mono">
                        Target Value: ₹{order.totalValue.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleOpenCollectionModal(order)}
                        className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Record Produce Collection</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 6: QUALITY INSPECTION & GRADING ────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_6_QUALITY' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 6: Hub Quality Inspection & Grading Station
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Scientific laboratory checks (Sugar Brix, firmness, moisture, pesticide residue assay). Accepted quantities proceed to packaging; rejected quantities are recorded transparently.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              {collectedAwaitingGrading.length} Batches Awaiting QA
            </span>
          </div>

          {collectedAwaitingGrading.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <ShieldCheck className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">No batches currently awaiting quality inspection</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">Collect produce from Stage 5 to queue batches for quality inspection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collectedAwaitingGrading.map((order) => {
                const isInspecting = selectedOrderForInspection === order.id;
                const totalCollected = order.collectedQuantityKg || order.quantityKg;

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                          <span className="text-[#ccd5ae]">•</span>
                          <span className="font-mono text-xs text-[#01472e]/70 font-semibold">{order.batchId}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#eaf4ec] text-[#01472e] px-2.5 py-0.5 rounded-full border border-[#a3b18a]/40">
                            Collected ({totalCollected.toLocaleString()} kg)
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#01472e] mt-2 flex items-center gap-2">
                          <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                          <span>{order.crop} ({order.variety || 'Hybrid'}) — {totalCollected.toLocaleString()} kg from {order.farmerName}</span>
                        </h4>
                      </div>

                      <button
                        onClick={() => isInspecting ? setSelectedOrderForInspection(null) : handleStartInspection(order)}
                        className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs self-start sm:self-auto cursor-pointer"
                      >
                        {isInspecting ? 'Cancel QA Form' : 'Open Inspection Form →'}
                      </button>
                    </div>

                    {/* Interactive Quality Form */}
                    {isInspecting && (
                      (() => {
                        const listing = produceListings.find(l => l.id === order.produceListingId);
                        if (!listing) return <div className="p-4 text-rose-500">Produce listing not found for order</div>;
                        return (
                          <div className="mt-4 animate-in fade-in">
                            <QualityVerificationModal
                              batch={listing}
                              onClose={() => setSelectedOrderForInspection(null)}
                              onSuccess={(result, obs, checklist) => {
                                const totalCollected = order.collectedQuantityKg || order.quantityKg;
                                
                                const metrics: QualityInspectionData = {
                                  sugarBrix: 5.2, 
                                  firmnessKgCm: 3.8,
                                  pesticideResidueTest: 'PASS - Organic / ND',
                                  moistureContent: '91.5%',
                                  verifiedGrade: (result.grade === 'PREMIUM' ? 'Premium' : result.grade === 'STANDARD' ? 'Standard' : 'Grade A') as any,
                                  inspectorName: currentUser.name || 'FPO QA Officer',
                                  inspectionDate: new Date().toLocaleDateString(),
                                  hubLocation: currentUser.location || 'FPO Hub',
                                  status: result.grade === 'REJECT' ? 'REJECTED' : 'PASSED',
                                  acceptedQuantityKg: totalCollected,
                                  rejectedQuantityKg: 0,
                                  inspectionNotes: `Score: ${result.score}/100. Sample size: ${obs.sampleSize}.`
                                };

                                fpoRecordQualityGrading(order.id, metrics);
                                setSelectedOrderForInspection(null);
                                showNotification(
                                  `Quality check certified for Order ${order.id}: Score ${result.score}/100, Grade ${result.grade}.`
                                );
                                confetti({ particleCount: 40, origin: { y: 0.6 } });
                                setActiveStage('STAGE_7_PACKING');
                              }}
                            />
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 7: PACKING, CRATING & QR CODE TRACEABILITY ─────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_7_PACKING' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 7: Standardized Crating, Packaging & QR Traceability
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Pack quality-accepted produce into standardized 25kg agro-crates, assign batch tamper-evident seals, and generate verifiable cryptographic QR passports.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              {gradedAwaitingPacking.length} Batches Ready for Crating
            </span>
          </div>

          {gradedAwaitingPacking.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <Package className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">No batches currently awaiting packing</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">Complete Quality Grading in Stage 6 to advance batches here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gradedAwaitingPacking.map((order) => {
                const acceptedVolume = order.acceptedQuantityKg !== undefined ? order.acceptedQuantityKg : (order.collectedQuantityKg || order.quantityKg);
                const estimatedCrates = Math.ceil(acceptedVolume / 25);

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#eaf4ec] text-[#01472e] px-2.5 py-0.5 rounded-full border border-[#a3b18a]/40">
                        {order.qualityGrade} • {order.qualityStatus || 'Passed'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                        <h4 className="font-semibold text-[#01472e] text-sm">{order.crop} ({order.variety || 'Hybrid'})</h4>
                      </div>
                      <p className="text-xs text-[#01472e]/80 mt-1">
                        Accepted Volume: <strong className="font-mono text-[#01472e]">{acceptedVolume.toLocaleString()} kg</strong> (~{estimatedCrates} crates)
                      </p>
                      <p className="text-xs text-[#01472e]/70 mt-0.5">
                        Destination: <strong className="text-[#01472e]">{order.buyerName}</strong> ({order.deliveryLocation})
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-[#01472e] hover:text-[#025a3b] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#01472e]" />
                        <span>Preview Passport QR</span>
                      </button>

                      <button
                        onClick={() => handleOpenPackingModal(order)}
                        className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Pack & Unlock Transport →</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 8: TRANSPORT & COLD-CHAIN DISPATCH ─────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_8_TRANSPORT' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 8: Transport Allocation & Cold-Chain Dispatch
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Assign temperature-monitored reefer freight, record carrier and driver handover, and dispatch shipments along optimized agricultural corridors.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200">
              {packedReadyForLogistics.length} Shipments Ready / In Logistics
            </span>
          </div>

          {packedReadyForLogistics.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <Truck className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">No batches currently awaiting transport dispatch</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">Pack and seal crates in Stage 7 to unlock transport readiness.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {packedReadyForLogistics.map((order) => {
                const isDispatched = order.status === 'In Transit' || order.status === 'Delivered';
                const transport = order.transportDetails;

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                        <span className="text-[#ccd5ae]">•</span>
                        <span className="font-mono text-xs text-[#01472e]/70">{order.batchId}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          order.status === 'Packed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          order.status === 'Transport Assigned' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                          'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        }`}
                      >
                        {order.status === 'Packed' ? 'Ready for Carrier Pickup' :
                         order.status === 'Transport Assigned' ? 'Awaiting Carrier Dispatch' : 'En Route (Cold-Chain Active)'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-[#01472e] flex items-center gap-2">
                        <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                        <span>{order.crop} — {order.packedQuantityKg || order.quantityKg} kg ({order.crateCount || Math.ceil((order.packedQuantityKg || order.quantityKg) / 25)} Crates)</span>
                      </h4>
                      <p className="text-xs text-[#01472e]/70 mt-0.5">
                        Route: {order.farmerLocation} ➔ <strong>{order.deliveryLocation}</strong>
                      </p>
                    </div>

                    {transport ? (
                      <div className="bg-white p-3.5 rounded-xl border border-[#ccd5ae]/30 space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold text-[#01472e]">
                          <span>{transport.carrierName}</span>
                          <span className="font-mono">{transport.vehicleNumber}</span>
                        </div>
                        <div className="flex justify-between text-[#01472e]/70 text-[11px]">
                          <span>Driver: {transport.driverName} ({transport.driverPhone})</span>
                          <span className="text-emerald-700 font-semibold font-mono">Temp: 4.2°C</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/60 p-3 rounded-xl border border-dashed border-[#ccd5ae]/60 text-xs text-[#01472e]/70">
                        Pre-assigned Carrier: Kaveri Agro Cold-Chain Express (Reefer 4.5°C)
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between text-xs">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-[#01472e] hover:text-[#025a3b] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Passport</span>
                      </button>

                      {order.status === 'Packed' ? (
                        <button
                          onClick={() => handleOpenTransportModal(order)}
                          className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Assign Carrier</span>
                        </button>
                      ) : order.status === 'Transport Assigned' ? (
                        <div className="text-xs py-2 px-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting Dispatch</span>
                        </div>
                      ) : (
                        <div className="text-xs py-2 px-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 flex items-center gap-1.5 font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          <span>In Transit to Buyer</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 9: BUYER DELIVERY HANDOVER & RECEIPT SIGN-OFF ───────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_9_DELIVERY' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 9: Buyer Facility Delivery & Quality Acceptance Sign-off
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Shipments arriving at institutional buyer receiving docks undergo handover inspection and digital receipt sign-off, triggering automated escrow payout.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
              {inTransitOrDeliveredOrders.length} In-Handover Orders
            </span>
          </div>

          {inTransitOrDeliveredOrders.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <MapPin className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">No shipments currently pending delivery sign-off</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">Dispatch shipments from Stage 8 to record buyer delivery.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {inTransitOrDeliveredOrders.map((order) => {
                const isDelivered = order.status === 'Delivered' || order.status === 'Buyer Confirmed' || order.status === 'Payment Pending' || order.status === 'Completed';
                const confirmation = order.buyerConfirmation;

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                        <span className="text-[#ccd5ae]">•</span>
                        <span className="font-mono text-xs text-[#01472e]/70">{order.batchId}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-[#01472e] flex items-center gap-2">
                        <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                        <span>{order.crop} ({order.packedQuantityKg || order.quantityKg} kg)</span>
                      </h4>
                      <p className="text-xs text-[#01472e]/80 mt-0.5">
                        Receiving Facility: <strong className="text-[#01472e]">{order.buyerName}</strong> ({order.deliveryLocation})
                      </p>
                    </div>

                    {confirmation ? (
                      <div className="bg-white p-3.5 rounded-xl border border-[#ccd5ae]/30 space-y-1 text-xs">
                        <div className="flex justify-between font-semibold text-[#01472e]">
                          <span>Status: {confirmation.acceptanceStatus}</span>
                          <span className="font-mono font-bold text-emerald-800">{confirmation.acceptedQuantityKg} kg Accepted</span>
                        </div>
                        <p className="text-[11px] text-[#01472e]/70">
                          Verified by: {confirmation.receiverName} ({confirmation.receiverRole})
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-3.5 rounded-xl border border-[#ccd5ae]/30 text-xs text-[#01472e]/80 space-y-1">
                        <p>Carrier Vehicle: <strong className="font-mono">{order.transportDetails?.vehicleNumber || 'TN-09-CB-4812'}</strong></p>
                        <p className="text-amber-800 font-semibold">Awaiting dock receiving officer quality sign-off.</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between text-xs">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-[#01472e] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Batch Passport</span>
                      </button>

                      {order.status === 'In Transit' ? (
                        <div className="text-xs py-2 px-4 rounded-xl border border-[#ccd5ae] bg-[#f9faf7] text-[#01472e]/70 flex items-center gap-1.5 font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          <span>In Transit to Buyer</span>
                        </div>
                      ) : !confirmation ? (
                        <div className="text-xs py-2 px-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 flex items-center gap-1.5 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting Buyer Sign-off</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveStage('STAGE_10_PAYMENT')}
                          className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>Proceed to Escrow Settlement →</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── STAGE 10: PAYMENT SETTLEMENT (89% FARMER REALIZATION) ─────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'STAGE_10_PAYMENT' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">
                  Stage 10: Escrow Settlement & 89% Farmer Realization Ledger
                </h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Demand-driven direct smart settlement: RBI e-RUPI programmable escrow guarantees 89% farmer payout within 24 hours of delivery, eliminating exploitative 45% mandi deductions.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Escrow Protection Active
            </span>
          </div>

          {settlementPendingOrders.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <Scale className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">No orders currently awaiting settlement processing</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">Confirm buyer delivery sign-off in Stage 9 to queue orders for instant settlement.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {settlementPendingOrders.map((order) => {
                const settleRecord = settlements.find((s) => s.orderId === order.id);
                const isCompleted =
                  order.status === 'Completed' ||
                  (settleRecord &&
                    (settleRecord.status === 'COMPLETED' ||
                      settleRecord.status === 'Transaction Completed' ||
                      settleRecord.status === 'Farmer Payment Completed'));
                const finalKg = order.acceptedQuantityKg || order.packedQuantityKg || order.quantityKg;
                const totalVal = Math.round(finalKg * order.pricePerKg);
                const farmerAmount = Math.round(totalVal * 0.89);
                const logisticsAmount = Math.round(totalVal * 0.08);
                const platformAmount = totalVal - farmerAmount - logisticsAmount;
                const traditionalMandiFarmerShare = Math.round(totalVal * 0.55);
                const farmerGain = farmerAmount - traditionalMandiFarmerShare;

                return (
                  <div key={order.id} className="p-6 border border-[#ccd5ae]/50 bg-[#faf9f5] rounded-2xl space-y-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ccd5ae]/30">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#01472e]">{order.id}</span>
                        <span className="text-[#ccd5ae]">•</span>
                        <span className="font-mono text-xs text-[#01472e]/70">Settlement Batch: {order.batchId}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {isCompleted ? '✓ Settled (Paid to Farmer Bank)' : 'Escrow Locked — Awaiting FPO Release'}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-[#01472e]">
                        Order Total: ₹{totalVal.toLocaleString()} ({finalKg.toLocaleString()} kg @ ₹{order.pricePerKg}/kg)
                      </span>
                    </div>

                    {/* Escrow Distribution Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                        <span className="text-emerald-800 font-semibold block text-[10px] uppercase tracking-wider">
                          Farmer Realization (89%)
                        </span>
                        <strong className="text-lg font-bold font-mono text-emerald-900">
                          ₹{farmerAmount.toLocaleString()}
                        </strong>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          +₹{farmerGain.toLocaleString()} (+61.8%) vs Mandi Middlemen
                        </p>
                      </div>

                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                        <span className="text-blue-800 font-semibold block text-[10px] uppercase tracking-wider">
                          Cold Logistics (8%)
                        </span>
                        <strong className="text-lg font-bold font-mono text-blue-900">
                          ₹{logisticsAmount.toLocaleString()}
                        </strong>
                        <p className="text-[10px] text-blue-700">Reefer Carrier & Drivers</p>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-slate-800 font-semibold block text-[10px] uppercase tracking-wider">
                          FPO Ops Fee (3%)
                        </span>
                        <strong className="text-lg font-bold font-mono text-slate-900">
                          ₹{platformAmount.toLocaleString()}
                        </strong>
                        <p className="text-[10px] text-slate-700">Testing & Hub Operations</p>
                      </div>

                      <div className="p-3.5 bg-white border border-[#ccd5ae]/40 rounded-xl space-y-1">
                        <span className="text-[#01472e]/70 font-semibold block text-[10px] uppercase tracking-wider">
                          Payout Gateway
                        </span>
                        <strong className="text-xs font-semibold text-[#01472e] block">
                          RBI e-RUPI Smart Voucher
                        </strong>
                        <p className="text-[10px] text-[#01472e]/60 font-mono">Instant Bank Credit</p>
                      </div>
                    </div>

                    {/* Contributing Farmers Bank Payout Breakdown */}
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-[#01472e] uppercase tracking-wider">
                        Direct Member Farmer Disbursals
                      </h5>
                      <div className="p-3 bg-white rounded-xl border border-[#ccd5ae]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-[#01472e]">{order.farmerName}</p>
                          <p className="text-[11px] text-[#01472e]/70">
                            Bank Account: Canara Bank **** **** 4892 • IFSC: CNRB0002148
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-emerald-800 block">
                            ₹{farmerAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#01472e]/60 font-mono">
                            UTR: {settleRecord?.utrNumber || 'ESCROW-ERUPI-2026-CONFIRMED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Settlement Execution Action */}
                    <div className="pt-2 border-t border-[#ccd5ae]/30 flex items-center justify-between text-xs">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-[#01472e] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Audit Provenance & Ledger</span>
                      </button>

                      {!isCompleted ? (
                        <button
                          onClick={() => handleExecuteSettlement(order.id)}
                          className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-2 shadow-md cursor-pointer font-bold"
                        >
                          <IndianRupee className="w-4 h-4" />
                          <span>Execute Instant Escrow Settlement</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-xl">
                          <Check className="w-4 h-4 text-emerald-800" />
                          <span>Transaction Completed & Farmer Paid</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── PRESERVED VIEW: MEMBER FARM PRODUCE SUPPLY POOL ──────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'MEMBER_SUPPLY' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">Member Farm Produce Supply Pool</h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Active crop listings submitted by member farmers. Aggregated and available for Smart Matching with institutional buyer requirements.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              {produceListings.length} Active Member Listings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produceListings.map((listing) => {
              const totalListed = listing.initialQuantityKg || (listing.quantityKg + (listing.allocatedQuantityKg || 0));
              const remaining = listing.quantityKg;
              const allocated = listing.allocatedQuantityKg || 0;
              const percentAllocated = totalListed > 0 ? Math.round((allocated / totalListed) * 100) : 0;

              return (
                <div key={listing.id} className="p-5 border border-[#ccd5ae]/40 hover:border-[#a3b18a] bg-[#faf9f5] rounded-2xl space-y-3 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#01472e]/70">{listing.id}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        remaining <= 0
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                      }`}>
                        {remaining <= 0 ? 'Fully Allocated' : listing.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <img src={getCropImageUrl(listing.crop)} alt={listing.crop} className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                        <h4 className="font-semibold text-[#01472e] text-sm">
                          {t(`crops.${listing.crop}`, listing.crop)}
                          {listing.variety && <span className="text-[#01472e]/60 font-normal ml-1">({listing.variety})</span>}
                        </h4>
                      </div>
                      <p className="text-xs text-[#01472e]/70 mt-0.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#a3b18a]" />
                        <span>Farmer: <strong className="text-[#01472e]">{listing.farmerName}</strong></span>
                      </p>
                      <p className="text-xs text-[#01472e]/70 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#a3b18a]" />
                        <span>{listing.location}</span>
                      </p>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-[#ccd5ae]/30 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#01472e]/70 font-medium">Available Supply:</span>
                        <span className="font-semibold text-[#01472e] font-mono">
                          {remaining.toLocaleString()} {listing.unit || 'kg'}
                        </span>
                      </div>
                      <div className="w-full bg-[#e9edc9]/50 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#01472e] h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, 100 - percentAllocated)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#01472e]/60 font-mono">
                        <span>Total: {totalListed.toLocaleString()} {listing.unit || 'kg'}</span>
                        <span>Allocated: {allocated.toLocaleString()} ({percentAllocated}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#01472e] font-mono">
                      ₹{listing.expectedPricePerKg}/kg • {listing.grade}
                    </span>
                    <button
                      onClick={() => {
                        setActiveStage('STAGE_2_MATCHING');
                      }}
                      className="px-3 py-1.5 bg-[#e9edc9]/60 hover:bg-[#e9edc9] text-[#01472e] text-xs font-semibold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#01472e]" />
                      <span>Match</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── PRESERVED VIEW: BULK CONSOLIDATION HUB ───────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'CONSOLIDATION' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">Bulk Order Consolidation & Provenance Hub</h3>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                Consolidated institutional volume orders maintaining 100% individual farmer source and buyer demand traceability.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              {bulkConsolidatedOrders.length} Consolidated Batches
            </span>
          </div>

          <div className="space-y-4">
            {bulkConsolidatedOrders.map((order) => {
              const requiredKg = order.quantityKg;
              const collectedKg = order.collectedQuantityKg || 0;
              const remainingKg = order.remainingCollectionKg !== undefined ? order.remainingCollectionKg : (requiredKg - collectedKg);
              const contributions = order.farmerContributions || [
                {
                  farmerId: order.farmerId,
                  farmerName: order.farmerName,
                  farmerLocation: order.farmerLocation,
                  produceListingId: order.produceListingId,
                  contributedQuantityKg: order.quantityKg,
                  collectedQuantityKg: collectedKg,
                  collectionStatus: 'FULLY_COLLECTED'
                }
              ];

              return (
                <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                      <span className="text-[#ccd5ae]">•</span>
                      <span className="font-mono text-xs text-[#01472e]/70 font-semibold">{order.batchId}</span>
                      {order.aggregatedGroupId && (
                        <span className="text-[10px] font-semibold bg-[#e9edc9] text-[#01472e] border border-[#ccd5ae] px-2.5 py-0.5 rounded-full">
                          Pooled: {order.aggregatedGroupId}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-[#ccd5ae]/50 bg-white text-[#01472e]">
                      Status: {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#ccd5ae]/30 text-xs">
                    <div>
                      <span className="text-[#01472e]/60 block font-semibold uppercase text-[10px]">Total Buyer Quantity</span>
                      <strong className="text-sm font-semibold font-mono text-[#01472e]">{requiredKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-[#01472e]/60 block font-semibold uppercase text-[10px]">Total Collected</span>
                      <strong className="text-sm font-semibold font-mono text-[#01472e]">{collectedKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-[#01472e]/60 block font-semibold uppercase text-[10px]">Remaining Collection</span>
                      <strong className="text-sm font-semibold font-mono text-amber-800">{remainingKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-[#01472e]/60 block font-semibold uppercase text-[10px]">Transaction Value</span>
                      <strong className="text-sm font-semibold font-mono text-[#01472e]">₹{order.totalValue.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Farmer Provenance Trail */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-semibold text-[#01472e] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#a3b18a]" />
                      <span>Farmer Provenance & Source Allotments ({contributions.length} Producers)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {contributions.map((c, i) => (
                        <div key={i} className="p-3.5 bg-white border border-[#ccd5ae]/30 rounded-xl space-y-1">
                          <div className="flex justify-between font-semibold text-[#01472e]">
                            <span>{c.farmerName}</span>
                            <span className="font-mono text-[#01472e]">{c.contributedQuantityKg.toLocaleString()} kg</span>
                          </div>
                          <p className="text-[11px] text-[#01472e]/70">{c.farmerLocation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#ccd5ae]/30 flex items-center justify-between text-xs">
                    <span className="text-[#01472e]/70">
                      Buyer: <strong className="text-[#01472e]">{order.buyerName}</strong>
                    </span>
                    <button
                      onClick={() => openPassportModal(order.batchId)}
                      className="text-[#01472e] hover:text-[#025a3b] font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Provenance Passport</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── PRESERVED VIEW: ALL COLLECTIVE BATCHES ───────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeStage === 'ALL' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">All Collective FPO Batches</h3>
              <p className="text-xs text-[#01472e]/70 mt-0.5">Comprehensive lifecycle status across collection, quality, crating, transport and settlement</p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/50 px-3.5 py-1 rounded-xl">
              {orders.length} Total Batches
            </span>
          </div>

          <div className="divide-y divide-[#ccd5ae]/20">
            {orders.map((order) => (
              <div key={order.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/30 flex items-center justify-center font-medium text-xs shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                      <span className="text-[#ccd5ae]">•</span>
                      <span className="font-mono text-xs text-[#01472e]/70">{order.batchId}</span>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#ccd5ae]/40 bg-[#faf9f5] text-[#01472e]">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#01472e] mt-2 flex items-center gap-2">
                      <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                      <span>{order.crop} — {order.quantityKg.toLocaleString()} kg @ ₹{order.pricePerKg}/kg (Total: ₹{order.totalValue.toLocaleString()})</span>
                    </p>
                    <p className="text-[11px] text-[#01472e]/70">
                      Farmer: {order.farmerName} ➔ Buyer: {order.buyerName} ({order.deliveryLocation})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => openPassportModal(order.batchId)}
                    className="btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#01472e]" />
                    <span>Passport</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer"
                  >
                    Order Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: CAPTURE BUYER DEMAND REQUIREMENT (STAGE 1) ────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {showCreateDemandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-[#ccd5ae]/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#eaf4ec] rounded-xl text-[#01472e]">
                  <ShoppingCart className="w-5 h-5 text-[#01472e]" />
                </div>
                <h4 className="font-semibold text-[#01472e] text-base tracking-tight">
                  Capture Contracted Buyer Demand Requirement
                </h4>
              </div>
              <button
                onClick={() => setShowCreateDemandModal(false)}
                className="text-[#01472e]/50 hover:text-[#01472e] font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDemandSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#01472e] font-semibold mb-1">Buyer / Institutional Organization Name</label>
                <input
                  type="text"
                  value={newDemandBuyerName}
                  onChange={(e) => setNewDemandBuyerName(e.target.value)}
                  className="input-modern font-semibold text-[#01472e]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#01472e] font-semibold mb-1">Crop Name</label>
                  <select
                    value={newDemandCrop}
                    onChange={(e) => setNewDemandCrop(e.target.value)}
                    className="input-modern font-semibold"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Potato">Potato</option>
                    <option value="Banana">Banana</option>
                    <option value="Carrot">Carrot</option>
                    <option value="Paddy">Paddy (Rice)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#01472e] font-semibold mb-1">Variety / Spec</label>
                  <input
                    type="text"
                    value={newDemandVariety}
                    onChange={(e) => setNewDemandVariety(e.target.value)}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#01472e] font-semibold mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={newDemandQty}
                    onChange={(e) => setNewDemandQty(Number(e.target.value))}
                    className="input-modern font-mono font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#01472e] font-semibold mb-1">Max Target Price (₹/kg)</label>
                  <input
                    type="number"
                    min="5"
                    step="0.5"
                    value={newDemandPrice}
                    onChange={(e) => setNewDemandPrice(Number(e.target.value))}
                    className="input-modern font-mono font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#01472e] font-semibold mb-1">Quality Grade</label>
                  <select
                    value={newDemandGrade}
                    onChange={(e) => setNewDemandGrade(e.target.value as any)}
                    className="input-modern font-semibold"
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Export Spec</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#01472e] font-semibold mb-1">Required Delivery Date</label>
                  <input
                    type="date"
                    value={newDemandDate}
                    onChange={(e) => setNewDemandDate(e.target.value)}
                    className="input-modern font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#01472e] font-semibold mb-1">Delivery Destination</label>
                  <input
                    type="text"
                    value={newDemandLocation}
                    onChange={(e) => setNewDemandLocation(e.target.value)}
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setShowCreateDemandModal(false)}
                  className="px-4 py-2 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Demand Contract</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: RECORD PRODUCE COLLECTION (STAGE 5) ───────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {collectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-[#ccd5ae]/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#eaf4ec] rounded-xl text-[#01472e]">
                  <Check className="w-5 h-5 text-[#01472e]" />
                </div>
                <h4 className="font-semibold text-[#01472e] text-base tracking-tight">
                  Record Farm Gate Produce Collection
                </h4>
              </div>
              <button
                onClick={() => setCollectionModalOrder(null)}
                className="text-[#01472e]/50 hover:text-[#01472e] font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordCollectionSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-1">
                <span className="font-mono text-[11px] text-[#01472e]/70 font-semibold">
                  Order: {collectionModalOrder.id} • Batch: {collectionModalOrder.batchId}
                </span>
                <p className="font-semibold text-[#01472e] text-sm flex items-center gap-2">
                  <img src={getCropImageUrl(collectionModalOrder.crop)} alt={collectionModalOrder.crop} className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                  <span>{collectionModalOrder.crop} ({collectionModalOrder.variety || 'Hybrid'})</span>
                </p>
                <div className="flex justify-between text-[#01472e]/70 pt-1">
                  <span>Total Contract: <strong>{collectionModalOrder.quantityKg.toLocaleString()} kg</strong></span>
                  <span>Collected: <strong className="text-[#01472e] font-semibold">{collectionModalOrder.collectedQuantityKg || 0} kg</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-[#01472e] font-semibold mb-1">Select Producer Farm Gate</label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => {
                    const fId = e.target.value;
                    setSelectedFarmerId(fId);
                    const contrib = (collectionModalOrder.farmerContributions || []).find((c) => c.farmerId === fId);
                    if (contrib) {
                      setCollectAmountKg(Math.max(0, contrib.contributedQuantityKg - (contrib.collectedQuantityKg || 0)));
                    }
                  }}
                  className="input-modern"
                >
                  {(collectionModalOrder.farmerContributions || [
                    {
                      farmerId: collectionModalOrder.farmerId,
                      farmerName: collectionModalOrder.farmerName,
                      farmerLocation: collectionModalOrder.farmerLocation,
                      contributedQuantityKg: collectionModalOrder.quantityKg,
                      collectedQuantityKg: collectionModalOrder.collectedQuantityKg || 0,
                      produceListingId: collectionModalOrder.produceListingId,
                      collectionStatus: 'PENDING'
                    }
                  ]).map((c) => (
                    <option key={c.farmerId} value={c.farmerId}>
                      {c.farmerName} — {c.contributedQuantityKg - (c.collectedQuantityKg || 0)} kg remaining of {c.contributedQuantityKg} kg quota
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[#01472e] font-semibold">Quantity to Collect (kg)</label>
                  <span className="text-[#01472e]/50">Max open balance</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={collectionModalOrder.remainingCollectionKg || collectionModalOrder.quantityKg}
                  value={collectAmountKg}
                  onChange={(e) => setCollectAmountKg(Number(e.target.value))}
                  className="input-modern font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[#01472e] font-semibold mb-1">Field Logistics Notes</label>
                <input
                  type="text"
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setCollectionModalOrder(null)}
                  className="px-4 py-2 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Farm Gate Pickup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: PACKING & CRATING (STAGE 7) ───────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {packingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-[#ccd5ae]/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#eaf4ec] rounded-xl text-[#01472e]">
                  <Package className="w-5 h-5 text-[#01472e]" />
                </div>
                <h4 className="font-semibold text-[#01472e] text-base tracking-tight">
                  Crating, Batch QR & Transport Readiness Gate
                </h4>
              </div>
              <button
                onClick={() => setPackingModalOrder(null)}
                className="text-[#01472e]/50 hover:text-[#01472e] font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPackingSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-1">
                <span className="font-mono text-[11px] text-[#01472e]/70 font-semibold">
                  Order: {packingModalOrder.id} • Batch: {packingModalOrder.batchId}
                </span>
                <p className="font-semibold text-[#01472e] text-sm flex items-center gap-2">
                  <img src={getCropImageUrl(packingModalOrder.crop)} alt={packingModalOrder.crop} className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                  <span>{packingModalOrder.crop} ({packingModalOrder.variety || 'Hybrid'})</span>
                </p>
                <div className="flex justify-between text-[#01472e]/70 pt-1">
                  <span>Quality Grade: <strong className="text-[#01472e]">{packingModalOrder.qualityGrade}</strong></span>
                  <span>Accepted Quantity: <strong className="text-[#01472e] font-mono">{packingModalOrder.acceptedQuantityKg || packingModalOrder.quantityKg} kg</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-[#01472e] font-semibold mb-1">Packed Quantity (kg)</label>
                <input
                  type="number"
                  min="1"
                  max={packingModalOrder.acceptedQuantityKg || packingModalOrder.quantityKg}
                  value={packQuantityKg}
                  onChange={(e) => setPackQuantityKg(Number(e.target.value))}
                  className="input-modern font-mono font-semibold"
                  required
                />
                <p className="text-[11px] text-[#01472e]/60 mt-1 font-mono">
                  Equivalent to ~{Math.ceil(packQuantityKg / 25)} crates (standard 25 kg unit payload)
                </p>
              </div>

              <div>
                <label className="block text-[#01472e] font-semibold mb-1">Packaging Specification</label>
                <select
                  value={crateType}
                  onChange={(e) => setCrateType(e.target.value)}
                  className="input-modern"
                >
                  <option value="Ventilated 25kg Food-Grade Agro-Crates">Ventilated 25kg Food-Grade Agro-Crates</option>
                  <option value="Corrugated High-Strength Export Cartons (20kg)">Corrugated High-Strength Export Cartons (20kg)</option>
                  <option value="Perforated Pre-Cooling Bins (50kg)">Perforated Pre-Cooling Bins (50kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#01472e] font-semibold mb-1">Tamper-Proof Batch Barcode Note</label>
                <input
                  type="text"
                  value={packNotes}
                  onChange={(e) => setPackNotes(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setPackingModalOrder(null)}
                  className="px-4 py-2 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Crate & Seal (Ready for Transport)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: TRANSPORT ASSIGNMENT & DISPATCH (STAGE 8) ─────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {transportModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-[#ccd5ae]/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-[#01472e] text-base tracking-tight">
                  Assign Cold-Chain Carrier & Dispatch
                </h4>
              </div>
              <button
                onClick={() => setTransportModalOrder(null)}
                className="text-[#01472e]/50 hover:text-[#01472e] font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchTransportSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-1">
                <span className="font-mono text-[11px] text-[#01472e]/70 font-semibold">
                  Order: {transportModalOrder.id} • Destination: {transportModalOrder.deliveryLocation}
                </span>
                <p className="font-semibold text-[#01472e] text-sm flex items-center gap-2">
                  <img src={getCropImageUrl(transportModalOrder.crop)} alt={transportModalOrder.crop} className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                  <span>{transportModalOrder.crop} — {transportModalOrder.packedQuantityKg || transportModalOrder.quantityKg} kg ({transportModalOrder.crateCount || Math.ceil((transportModalOrder.packedQuantityKg || transportModalOrder.quantityKg) / 25)} Crates)</span>
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1">
                  <label className="text-[#01472e] font-semibold flex items-center gap-2">
                    Available Transport Drivers
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold tracking-wide uppercase">Auto-assigning Nearest</span>
                  </label>
                  <span className="text-xs text-[#01472e]/60">{AVAILABLE_TRANSPORTS.length} nearby</span>
                </div>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {AVAILABLE_TRANSPORTS.map((transport) => (
                    <div 
                      key={transport.id}
                      onClick={() => setSelectedTransportId(transport.id)}
                      className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedTransportId === transport.id ? 'border-[#01472e] bg-[#f0fdf4] shadow-sm' : 'border-[#ccd5ae]/30 hover:border-[#ccd5ae] bg-white'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-[#01472e] flex items-center gap-1.5">
                            {transport.carrierName}
                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded flex items-center">⭐ {transport.rating}</span>
                          </div>
                          <div className="text-[11px] text-[#01472e]/70 font-semibold mt-0.5">
                            {transport.vehicleType} • <span className="font-mono">{transport.vehicleNumber}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${transport.status === 'Nearest Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {transport.status}
                          </span>
                          <span className="text-[10px] font-medium text-[#01472e]/60 flex items-center gap-1"><MapPin className="w-3 h-3" /> {transport.distanceKm} km away</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-black/5">
                        <div className="text-[11px] font-semibold text-[#01472e]/80 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Driver: {transport.driverName}
                        </div>
                        <div className="text-[11px] font-mono font-medium text-[#01472e]/70 flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {transport.driverPhone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setTransportModalOrder(null)}
                  className="px-4 py-2 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer font-semibold"
                >
                  <Truck className="w-4 h-4" />
                  <span>Confirm Dispatch & Start Transit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
