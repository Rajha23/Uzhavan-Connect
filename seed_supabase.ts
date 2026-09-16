import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { INITIAL_PRODUCE_LISTINGS, INITIAL_DEMAND_REQUESTS, INITIAL_ORDERS, INITIAL_PASSPORTS, INITIAL_SETTLEMENTS } from './src/data/mockData';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🌱 Starting Database Seed for Uzhavan Connect...");

  try {
    // 1. Seed Produce Listings
    if (INITIAL_PRODUCE_LISTINGS && INITIAL_PRODUCE_LISTINGS.length > 0) {
      console.log(`Seeding ${INITIAL_PRODUCE_LISTINGS.length} Produce Listings...`);
      const { error } = await supabase.from('produce_listings').upsert(INITIAL_PRODUCE_LISTINGS.map(p => ({
        id: p.id,
        farmer_id: p.farmerId,
        farmer_name: p.farmerName,
        crop: p.crop,
        variety: p.variety,
        quantity_kg: p.quantityKg,
        grade: p.grade,
        expected_price_per_kg: p.expectedPricePerKg,
        harvest_date: p.harvestDate,
        availability_date: p.availabilityDate,
        location: p.location,
        status: p.status,
        quality_metrics: p.qualityMetrics || {}
      })));
      if (error) throw new Error(`Produce Listings: ${error.message}`);
    }

    // 2. Seed Demand Requests
    if (INITIAL_DEMAND_REQUESTS && INITIAL_DEMAND_REQUESTS.length > 0) {
      console.log(`Seeding ${INITIAL_DEMAND_REQUESTS.length} Demand Requests...`);
      const { error } = await supabase.from('demand_requests').upsert(INITIAL_DEMAND_REQUESTS.map(d => ({
        id: d.id,
        buyer_id: d.buyerId,
        buyer_name: d.buyerName,
        buyer_type: d.buyerType,
        crop: d.crop,
        variety: d.variety || '',
        quantity_kg: d.quantityKg,
        quality_requirement: d.qualityRequirement,
        location: d.location,
        delivery_date: d.deliveryDate,
        delivery_time_window: d.deliveryTimeWindow,
        max_target_price_per_kg: d.maxTargetPricePerKg,
        status: d.status,
        urgency: d.urgency,
        match_score: d.matchScore
      })));
      if (error) throw new Error(`Demand Requests: ${error.message}`);
    }

    // 3. Seed Orders
    if (INITIAL_ORDERS && INITIAL_ORDERS.length > 0) {
      console.log(`Seeding ${INITIAL_ORDERS.length} Orders...`);
      const { error } = await supabase.from('orders').upsert(INITIAL_ORDERS.map(o => ({
        id: o.id,
        batch_id: o.batchId,
        buyer_id: o.buyerId,
        buyer_name: o.buyerName,
        farmer_id: o.farmerId,
        farmer_name: o.farmerName,
        fpo_id: o.fpoId,
        fpo_name: o.fpoName,
        crop: o.crop,
        variety: o.variety,
        quantity_kg: o.quantityKg,
        packed_quantity_kg: o.packedQuantityKg,
        crate_count: o.crateCount,
        price_per_kg: o.pricePerKg,
        fpo_margin_per_kg: o.fpoMarginPerKg,
        total_value: o.totalValue,
        status: o.status,
        delivery_location: o.deliveryLocation,
        is_ready_for_transport: o.isReadyForTransport,
        quality_inspection: o.qualityInspection,
        transport_details: o.transportDetails,
        buyer_confirmation: o.buyerConfirmation,
        payment_status: o.paymentStatus
      })));
      if (error) throw new Error(`Orders: ${error.message}`);
    }

    // 4. Seed Produce Passports
    if (INITIAL_PASSPORTS && INITIAL_PASSPORTS.length > 0) {
      console.log(`Seeding ${INITIAL_PASSPORTS.length} Passports...`);
      const { error } = await supabase.from('produce_passports').upsert(INITIAL_PASSPORTS.map(p => ({
        batch_id: p.batchId,
        crop: p.crop,
        variety: p.variety,
        farmer_or_fpo: p.farmerOrFpo,
        farm_location: p.farmLocation,
        harvest_date: p.harvestDate,
        quantity_kg: p.quantityKg,
        quality_grade: p.qualityGrade,
        inspection_metrics: p.inspectionMetrics,
        collection_hub: p.collectionHub,
        shipment_id: p.shipmentId,
        vehicle_number: p.vehicleNumber,
        destination: p.destination,
        qr_code_url: p.qrCodeUrl,
        current_status: p.currentStatus,
        timeline: p.timeline
      })));
      if (error) throw new Error(`Passports: ${error.message}`);
    }

    // 5. Seed Settlements
    if (INITIAL_SETTLEMENTS && INITIAL_SETTLEMENTS.length > 0) {
      console.log(`Seeding ${INITIAL_SETTLEMENTS.length} Settlements...`);
      const { error } = await supabase.from('settlement_records').upsert(INITIAL_SETTLEMENTS.map(s => ({
        id: s.id,
        order_id: s.orderId,
        batch_id: s.batchId,
        crop: s.crop,
        quantity_kg: s.quantityKg,
        buyer_name: s.buyerName,
        farmer_or_fpo_name: s.farmerOrFpoName,
        total_order_value: s.totalOrderValue,
        farmer_amount: s.farmerAmount,
        logistics_amount: s.logisticsAmount,
        platform_amount: s.platformAmount,
        farmer_realization_percentage: s.farmerRealizationPercentage,
        traditional_farmer_earnings: s.traditionalFarmerEarnings,
        earnings_gain_percentage: s.earningsGainPercentage,
        status: s.status,
        settlement_date: s.settlementDate,
        utr_number: s.utrNumber,
        payment_mode: s.paymentMode,
        buyer_payment_reference: s.buyerPaymentReference,
        buyer_payment_recorded_at: s.buyerPaymentRecordedAt,
        fpo_settled_at: s.fpoSettledAt,
        farmer_settled_at: s.farmerSettledAt,
        farmer_breakdown: s.farmerBreakdown
      })));
      if (error) throw new Error(`Settlements: ${error.message}`);
    }

    console.log("✅ Database Seeding Complete!");

  } catch (err) {
    console.error("❌ Seeding Failed:", err);
  }
}

seed();
