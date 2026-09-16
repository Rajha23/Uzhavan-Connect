-- Schema v2 Upgrade for Uzhavan Connect (Full Alignment with src/types/index.ts)

-- We will drop and recreate the core workflow tables since the types are completely different.
-- Your profiles table remains intact.

DROP TABLE IF EXISTS public.settlement_records CASCADE;
DROP TABLE IF EXISTS public.produce_passports CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.demand_requests CASCADE;
DROP TABLE IF EXISTS public.produce_listings CASCADE;

-- 2. Produce Listings Table (for Farmers/FPOs)
create table public.produce_listings (
  id text primary key,
  farmer_id text not null,
  farmer_name text not null,
  crop text not null,
  variety text,
  quantity_kg numeric not null,
  grade text not null,
  expected_price_per_kg numeric not null,
  harvest_date text not null,
  availability_date text not null,
  location text not null,
  status text not null default 'AVAILABLE',
  quality_metrics jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Demand Requests Table (for Buyers)
create table public.demand_requests (
  id text primary key,
  buyer_id text not null,
  buyer_name text not null,
  buyer_type text not null,
  crop text not null,
  variety text,
  quantity_kg numeric not null,
  quality_requirement text not null,
  location text not null,
  delivery_date text not null,
  delivery_time_window text,
  max_target_price_per_kg numeric not null,
  status text not null default 'OPEN',
  urgency text,
  match_score numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Orders Table (Matches WorkflowOrder in TS)
create table public.orders (
  id text primary key,
  batch_id text,
  buyer_id text not null,
  buyer_name text not null,
  farmer_id text,
  farmer_name text,
  fpo_id text,
  fpo_name text,
  crop text not null,
  variety text,
  quantity_kg numeric not null,
  packed_quantity_kg numeric,
  crate_count integer,
  price_per_kg numeric not null,
  fpo_margin_per_kg numeric,
  total_value numeric not null,
  status text not null, 
  delivery_location text,
  is_ready_for_transport boolean default false,
  quality_inspection jsonb,
  transport_details jsonb,
  buyer_confirmation jsonb,
  payment_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Produce Passports (Traceability)
create table public.produce_passports (
  batch_id text primary key,
  crop text not null,
  variety text,
  farmer_or_fpo text,
  farm_location text,
  harvest_date text,
  quantity_kg numeric,
  quality_grade text,
  inspection_metrics jsonb,
  collection_hub text,
  shipment_id text,
  vehicle_number text,
  destination text,
  qr_code_url text,
  current_status text,
  timeline jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Settlement Records
create table public.settlement_records (
  id text primary key,
  order_id text not null,
  batch_id text,
  crop text not null,
  quantity_kg numeric not null,
  buyer_name text not null,
  farmer_or_fpo_name text not null,
  total_order_value numeric not null,
  farmer_amount numeric not null,
  logistics_amount numeric not null,
  platform_amount numeric not null,
  farmer_realization_percentage numeric,
  traditional_farmer_earnings numeric,
  earnings_gain_percentage numeric,
  status text not null default 'PENDING',
  settlement_date text,
  utr_number text,
  payment_mode text,
  buyer_payment_reference text,
  buyer_payment_recorded_at text,
  fpo_settled_at text,
  farmer_settled_at text,
  farmer_breakdown jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS for rapid prototyping so the frontend can read/write without complex auth policies
alter table public.produce_listings disable row level security;
alter table public.demand_requests disable row level security;
alter table public.orders disable row level security;
alter table public.produce_passports disable row level security;
alter table public.settlement_records disable row level security;
