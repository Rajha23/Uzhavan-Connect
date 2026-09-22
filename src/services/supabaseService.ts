import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ProduceListing,
  DemandRequest,
  WorkflowOrder,
  ProducePassport,
  SettlementRecord
} from '../types';

/**
 * Helper to handle Supabase errors gracefully.
 */
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase Error during ${operation}:`, error);
  // We can throw here or let the caller handle it.
  throw error;
};

// =========================================
// PRODUCE LISTINGS
// =========================================
export const fetchProduceListings = async (): Promise<ProduceListing[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('produce_listings').select('*').order('created_at', { ascending: false });
  if (error) handleSupabaseError(error, 'fetchProduceListings');
  return (data || []).map(row => ({
    id: row.id,
    farmerId: row.farmer_id,
    farmerName: row.farmer_name,
    crop: row.crop,
    variety: row.variety,
    quantityKg: row.quantity_kg,
    grade: row.grade,
    expectedPricePerKg: row.expected_price_per_kg,
    harvestDate: row.harvest_date,
    availabilityDate: row.availability_date,
    location: row.location,
    fpoId: row.fpo_id,
    fpoName: row.fpo_name,
    status: row.status,
    coordinates: row.coordinates
  })) as ProduceListing[];
};

export const insertHarvestRecord = async (record: any) => {
  if (!isSupabaseConfigured) return;
  // Simulated network call for Harvest Records
  console.log('[Mock Backend] Inserting harvest record:', record);
  return new Promise(resolve => setTimeout(resolve, 500));
};

export const insertProduceListing = async (listing: ProduceListing) => {
  if (!isSupabaseConfigured) return;
  if (listing.quantityKg <= 0) throw new Error("Quantity must be greater than zero.");
  if (listing.expectedPricePerKg !== undefined && listing.expectedPricePerKg <= 0) throw new Error("Expected price must be positive.");
  const row = {
    id: listing.id,
    farmer_id: listing.farmerId,
    farmer_name: listing.farmerName,
    crop: listing.crop,
    variety: listing.variety,
    quantity_kg: listing.quantityKg,
    grade: listing.grade,
    expected_price_per_kg: listing.expectedPricePerKg,
    harvest_date: listing.harvestDate,
    availability_date: listing.availabilityDate,
    location: listing.location,
    fpo_id: listing.fpoId,
    fpo_name: listing.fpoName,
    status: listing.status,
    coordinates: listing.coordinates
  };
  const { error } = await supabase.from('produce_listings').insert([row]);
  if (error) handleSupabaseError(error, 'insertProduceListing');
};

export const updateProduceListingStatus = async (id: string, status: ProduceListing['status']) => {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('produce_listings').update({ status }).eq('id', id);
  if (error) handleSupabaseError(error, 'updateProduceListingStatus');
};


// =========================================
// DEMAND REQUESTS
// =========================================
export const fetchDemandRequests = async (): Promise<DemandRequest[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('demand_requests').select('*').order('created_at', { ascending: false });
  if (error) handleSupabaseError(error, 'fetchDemandRequests');
  return (data || []).map(row => ({
    id: row.id,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    buyerType: row.buyer_type,
    crop: row.crop,
    variety: row.variety,
    quantityKg: row.quantity_kg,
    qualityRequirement: row.quality_requirement,
    location: row.location,
    deliveryDate: row.delivery_date,
    deliveryTimeWindow: row.delivery_time_window,
    maxTargetPricePerKg: row.max_target_price_per_kg,
    status: row.status,
    createdAt: row.created_at,
    coordinates: row.coordinates
  })) as DemandRequest[];
};

export const insertDemandRequest = async (request: DemandRequest) => {
  if (!isSupabaseConfigured) return;
  if (request.quantityKg <= 0) throw new Error("Demand quantity must be greater than zero.");
  if (request.maxTargetPricePerKg !== undefined && request.maxTargetPricePerKg <= 0) throw new Error("Max target price must be positive.");
  const row = {
    id: request.id,
    buyer_id: request.buyerId,
    buyer_name: request.buyerName,
    buyer_type: request.buyerType,
    crop: request.crop,
    variety: request.variety,
    quantity_kg: request.quantityKg,
    quality_requirement: request.qualityRequirement,
    location: request.location,
    delivery_date: request.deliveryDate,
    delivery_time_window: request.deliveryTimeWindow,
    max_target_price_per_kg: request.maxTargetPricePerKg,
    status: request.status,
    coordinates: request.coordinates
  };
  const { error } = await supabase.from('demand_requests').insert([row]);
  if (error) handleSupabaseError(error, 'insertDemandRequest');
};

export const updateDemandRequestStatus = async (id: string, status: DemandRequest['status']) => {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('demand_requests').update({ status }).eq('id', id);
  if (error) handleSupabaseError(error, 'updateDemandRequestStatus');
};


// =========================================
// ORDERS (WORKFLOW)
// =========================================
export const fetchOrders = async (): Promise<WorkflowOrder[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) handleSupabaseError(error, 'fetchOrders');
  
  // Convert snake_case from DB back to camelCase properties where needed, 
  // or rely on our column names mostly matching (except boolean which we'll handle).
  // Actually, our schema_v2 uses snake_case, but our frontend uses camelCase!
  // To avoid massive mapping, let's map them explicitly here:
  return (data || []).map(row => ({
    id: row.id,
    batchId: row.batch_id,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    farmerId: row.farmer_id,
    farmerName: row.farmer_name,
    fpoId: row.fpo_id,
    fpoName: row.fpo_name,
    crop: row.crop,
    variety: row.variety,
    quantityKg: row.quantity_kg,
    packedQuantityKg: row.packed_quantity_kg,
    crateCount: row.crate_count,
    pricePerKg: row.price_per_kg,
    fpoMarginPerKg: row.fpo_margin_per_kg,
    totalValue: row.total_value,
    status: row.status,
    deliveryLocation: row.delivery_location,
    isReadyForTransport: row.is_ready_for_transport,
    inspectionMetrics: row.quality_inspection || undefined,
    transportDetails: row.transport_details || undefined,
    timeline: row.timeline || []
  })) as unknown as WorkflowOrder[];
};

export const insertOrder = async (order: WorkflowOrder) => {
  if (!isSupabaseConfigured) return;
  if (order.quantityKg <= 0) throw new Error("Order quantity must be greater than zero.");
  if (order.pricePerKg <= 0) throw new Error("Order price must be greater than zero.");
  if (!order.buyerId || !order.farmerId || !order.crop) throw new Error("Missing required order fields.");
  const row = {
    id: order.id,
    batch_id: order.batchId,
    buyer_id: order.buyerId,
    buyer_name: order.buyerName,
    farmer_id: order.farmerId,
    farmer_name: order.farmerName,
    crop: order.crop,
    variety: order.variety || null,
    quantity_kg: order.quantityKg,
    price_per_kg: order.pricePerKg,
    total_value: order.totalValue,
    status: order.status,
    delivery_location: order.deliveryLocation,
    farmer_location: order.farmerLocation,
    quality_grade: order.qualityGrade,
    quality_inspection: order.inspectionMetrics || null,
    transport_details: order.transportDetails || null,
    timeline: order.timeline || []
  };
  const { error } = await supabase.from('orders').insert([row]);
  if (error) handleSupabaseError(error, 'insertOrder');
};

export const updateOrder = async (id: string, updates: Partial<WorkflowOrder>) => {
  if (!isSupabaseConfigured) return;
  
  if (updates.packedQuantityKg !== undefined && updates.packedQuantityKg < 0) {
    throw new Error("Packed quantity cannot be negative.");
  }
  
  const rowUpdates: any = {};
  if (updates.status !== undefined) rowUpdates.status = updates.status;
  if (updates.batchId !== undefined) rowUpdates.batch_id = updates.batchId;
  if (updates.packedQuantityKg !== undefined) rowUpdates.packed_quantity_kg = updates.packedQuantityKg;
  if (updates.qualityGrade !== undefined) rowUpdates.quality_grade = updates.qualityGrade;
  if (updates.inspectionMetrics !== undefined) rowUpdates.quality_inspection = updates.inspectionMetrics;
  if (updates.transportDetails !== undefined) rowUpdates.transport_details = updates.transportDetails;
  if (updates.timeline !== undefined) rowUpdates.timeline = updates.timeline;
  
  const { error } = await supabase.from('orders').update(rowUpdates).eq('id', id);
  if (error) handleSupabaseError(error, 'updateOrder');
};


// =========================================
// PRODUCE PASSPORTS
// =========================================
export const fetchProducePassports = async (): Promise<ProducePassport[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('produce_passports').select('*');
  if (error) handleSupabaseError(error, 'fetchProducePassports');
  
  return (data || []).map(row => ({
    batchId: row.batch_id,
    crop: row.crop,
    variety: row.variety,
    farmerOrFpo: row.farmer_or_fpo,
    farmLocation: row.farm_location,
    harvestDate: row.harvest_date,
    quantityKg: row.quantity_kg,
    qualityGrade: row.quality_grade,
    inspectionMetrics: row.inspection_metrics,
    collectionHub: row.collection_hub,
    shipmentId: row.shipment_id,
    vehicleNumber: row.vehicle_number,
    destination: row.destination,
    qrCodeUrl: row.qr_code_url,
    currentStatus: row.current_status,
    timeline: row.timeline
  })) as ProducePassport[];
};

export const insertProducePassport = async (passport: ProducePassport) => {
  if (!isSupabaseConfigured) return;
  const row = {
    batch_id: passport.batchId,
    crop: passport.crop,
    variety: passport.variety,
    farmer_or_fpo: passport.farmerOrFpo,
    farm_location: passport.farmLocation,
    harvest_date: passport.harvestDate,
    quantity_kg: passport.quantityKg,
    quality_grade: passport.qualityGrade,
    inspection_metrics: passport.inspectionMetrics,
    collection_hub: passport.collectionHub,
    shipment_id: passport.shipmentId,
    vehicle_number: passport.vehicleNumber,
    destination: passport.destination,
    qr_code_url: passport.qrCodeUrl,
    current_status: passport.currentStatus,
    timeline: passport.timeline
  };
  const { error } = await supabase.from('produce_passports').insert([row]);
  if (error) handleSupabaseError(error, 'insertProducePassport');
};

export const updateProducePassportTimeline = async (batchId: string, timelineItem: any) => {
  if (!isSupabaseConfigured) return;
  // First fetch the existing timeline
  const { data, error: fetchErr } = await supabase.from('produce_passports').select('timeline, current_status').eq('batch_id', batchId).single();
  if (fetchErr) return handleSupabaseError(fetchErr, 'updateProducePassportTimeline (fetch)');
  
  const currentTimeline = data.timeline || [];
  currentTimeline.push(timelineItem);
  
  const { error: updErr } = await supabase.from('produce_passports').update({
    timeline: currentTimeline,
    current_status: timelineItem.title // Or step logic
  }).eq('batch_id', batchId);
  
  if (updErr) handleSupabaseError(updErr, 'updateProducePassportTimeline (update)');
};


// =========================================
// SETTLEMENT RECORDS
// =========================================
export const fetchSettlements = async (): Promise<SettlementRecord[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('settlement_records').select('*');
  if (error) handleSupabaseError(error, 'fetchSettlements');
  
  return (data || []).map(row => ({
    id: row.id,
    orderId: row.order_id,
    batchId: row.batch_id,
    crop: row.crop,
    quantityKg: row.quantity_kg,
    buyerName: row.buyer_name,
    farmerOrFpoName: row.farmer_or_fpo_name,
    totalOrderValue: row.total_order_value,
    farmerAmount: row.farmer_amount,
    logisticsAmount: row.logistics_amount,
    platformAmount: row.platform_amount,
    farmerRealizationPercentage: row.farmer_realization_percentage,
    traditionalFarmerEarnings: row.traditional_farmer_earnings,
    earningsGainPercentage: row.earnings_gain_percentage,
    status: row.status,
    settlementDate: row.settlement_date,
    utrNumber: row.utr_number,
    paymentMode: row.payment_mode,
    buyerPaymentReference: row.buyer_payment_reference,
    buyerPaymentRecordedAt: row.buyer_payment_recorded_at,
    fpoSettledAt: row.fpo_settled_at,
    farmerSettledAt: row.farmer_settled_at,
    farmerBreakdown: row.farmer_breakdown
  })) as SettlementRecord[];
};

export const insertSettlement = async (settlement: SettlementRecord) => {
  if (!isSupabaseConfigured) return;
  const row = {
    id: settlement.id,
    order_id: settlement.orderId,
    batch_id: settlement.batchId,
    crop: settlement.crop,
    quantity_kg: settlement.quantityKg,
    buyer_name: settlement.buyerName,
    farmer_or_fpo_name: settlement.farmerOrFpoName,
    total_order_value: settlement.totalOrderValue,
    farmer_amount: settlement.farmerAmount,
    logistics_amount: settlement.logisticsAmount,
    platform_amount: settlement.platformAmount,
    farmer_realization_percentage: settlement.farmerRealizationPercentage,
    traditional_farmer_earnings: settlement.traditionalFarmerEarnings,
    earnings_gain_percentage: settlement.earningsGainPercentage,
    status: settlement.status,
    settlement_date: settlement.settlementDate,
    utr_number: settlement.utrNumber,
    payment_mode: settlement.paymentMode,
    buyer_payment_reference: settlement.buyerPaymentReference,
    buyer_payment_recorded_at: settlement.buyerPaymentRecordedAt,
    fpo_settled_at: settlement.fpoSettledAt,
    farmer_settled_at: settlement.farmerSettledAt,
    farmer_breakdown: settlement.farmerBreakdown
  };
  const { error } = await supabase.from('settlement_records').insert([row]);
  if (error) handleSupabaseError(error, 'insertSettlement');
};

export const updateSettlementStatus = async (id: string, updates: Partial<SettlementRecord>) => {
  if (!isSupabaseConfigured) return;
  const rowUpdates: any = {};
  if (updates.status !== undefined) rowUpdates.status = updates.status;
  if (updates.utrNumber !== undefined) rowUpdates.utr_number = updates.utrNumber;
  if (updates.buyerPaymentReference !== undefined) rowUpdates.buyer_payment_reference = updates.buyerPaymentReference;
  if (updates.buyerPaymentRecordedAt !== undefined) rowUpdates.buyer_payment_recorded_at = updates.buyerPaymentRecordedAt;
  if (updates.fpoSettledAt !== undefined) rowUpdates.fpo_settled_at = updates.fpoSettledAt;
  if (updates.farmerSettledAt !== undefined) rowUpdates.farmer_settled_at = updates.farmerSettledAt;
  if (updates.farmerBreakdown !== undefined) rowUpdates.farmer_breakdown = updates.farmerBreakdown;

  const { error } = await supabase.from('settlement_records').update(rowUpdates).eq('id', id);
  if (error) handleSupabaseError(error, 'updateSettlementStatus');
};
