/**
 * Uzhavan Connect REST API Service Architecture
 * Now connected to Supabase PostgreSQL & Auth with fallback to demo data
 */

import {
  registerUserAccount,
  authenticateCredentials,
  normalizeEmail,
  normalizeRole
} from './authVault';

import {
  DemandRequest,
  DemandPool,
  ForecastSignal,
  ProduceListing,
  SmartMatchSupplier,
  RoutePlan,
  ProducePassport,
  SettlementRecord,
  UserProfile,
  UserRole
} from '../types';

import {
  CHENNAI_TOMATO_FORECAST,
  INITIAL_DEMAND_REQUESTS,
  INITIAL_DEMAND_POOL,
  INITIAL_FARMER_LISTINGS,
  SMART_MATCH_SUPPLIERS,
  OPTIMIZED_ROUTE_PLAN,
  DEMO_PRODUCE_PASSPORT,
  DEMO_SETTLEMENT,
  DEMO_USERS
} from '../data/mockData';

import { supabase } from '../lib/supabase';
import { ApiClient } from './apiClient';

// In-memory fallback store
let listingsStore: ProduceListing[] = [];
let demandsStore: DemandRequest[] = [];
let poolsStore: DemandPool[] = [];

export const apiService = {
  // Authentication & User Service
  login: async (
    arg1: UserRole | string,
    arg2?: string,
    arg3?: string
  ): Promise<{ token: string; user: UserProfile }> => {
    let identifier = '';
    let password = '';
    let roleHint: UserRole | undefined;

    const validRoles: UserRole[] = ['FARMER', 'RETAIL_BUYER', 'BULK_BUYER', 'FPO_AGGREGATOR', 'LOGISTICS', 'ADMIN'];
    if (validRoles.includes(arg1 as UserRole) && arg2 && arg3) {
      roleHint = arg1 as UserRole;
      identifier = arg2;
      password = arg3;
    } else if (typeof arg1 === 'string' && arg2) {
      identifier = arg1;
      password = arg2;
      if (arg3 && validRoles.includes(arg3 as UserRole)) {
        roleHint = arg3 as UserRole;
      }
    } else {
      identifier = String(arg1 || '');
      password = String(arg2 || '');
    }

    const rawId = identifier.trim();
    const rawPass = password.trim();

    if (!rawId || !rawPass) {
      throw new Error('Please enter both email/mobile and password.');
    }

    const normEmail = normalizeEmail(rawId);
    const isEmail = rawId.includes('@');

    // Custom Admin Bypass
    if (rawId === 'admin@gmail.com' && rawPass === 'admin123') {
      const mockToken = `uzhavanconnect_jwt_admin_${Date.now()}`;
      ApiClient.setToken(mockToken);
      return {
        token: mockToken,
        user: {
          ...DEMO_USERS.ADMIN,
          email: 'admin@gmail.com'
        }
      };
    }

    // 1. Attempt Supabase Login if configured and identifier is email
    if (supabase && isEmail) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normEmail,
          password: rawPass
        });

        if (!authError && authData?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profile && !profileError) {
            const role = normalizeRole(profile.role || roleHint);
            const userProfile: UserProfile = {
              id: profile.id,
              name: profile.name || 'Member',
              role,
              phone: profile.phone || '',
              email: profile.email || normEmail,
              location: profile.location || '',
              organization: profile.organization || '',
              village: profile.village,
              district: profile.district,
              state: profile.state,
              farmSizeAcres: profile.farm_size_acres,
              mainCrops: profile.main_crops,
              fpoName: profile.fpo_name
            };

            const token = authData.session?.access_token || `uzhavan_jwt_${role.toLowerCase()}_${Date.now()}`;
            ApiClient.setToken(token);
            return { token, user: userProfile };
          }
        }
      } catch (err: any) {
        console.warn('Supabase auth notice:', err?.message);
      }
    }

    // 2. Fallback to authVault (local storage crypto vault)
    try {
      const { user, token } = await authenticateCredentials(rawId, rawPass);
      ApiClient.setToken(token);
      return { token, user };
    } catch (vaultErr: any) {
      // 3. Fallback to DEMO_USERS using SecurePass@2026
      if (rawPass === 'SecurePass@2026') {
        const fallbackRole = roleHint || 'FARMER';
        const roleFallback = DEMO_USERS[fallbackRole] || DEMO_USERS.FARMER;
        const mockToken = `uzhavanconnect_jwt_${fallbackRole.toLowerCase()}_${Date.now()}`;

        let displayName = roleFallback.name;
        if (isEmail) {
          const raw = rawId.split('@')[0].replace(/[0-9_-]/g, ' ').trim();
          displayName = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : rawId.split('@')[0];
        } else if (!/^\+?[0-9\s-]+$/.test(rawId)) {
          displayName = rawId.charAt(0).toUpperCase() + rawId.slice(1);
        }

        const userProfile: UserProfile = {
          ...roleFallback,
          name: displayName,
          email: isEmail ? rawId : roleFallback.email,
          phone: !isEmail ? rawId : roleFallback.phone
        };

        ApiClient.setToken(mockToken);
        return { token: mockToken, user: userProfile };
      }
      
      throw new Error(vaultErr.message || 'Invalid email or password. Please check your credentials and try again.');
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    mobile: string;
    password?: string;
    role: UserRole;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
    mainCrop?: string;
    farmSize?: number;
  }): Promise<UserProfile> => {
    // 1. Attempt Supabase Registration if configured
    if (supabase && userData.email) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password || 'Farmer@2026',
          options: {
            data: {
              name: userData.name,
              role: userData.role
            }
          }
        });
        
        if (!error && data.user) {
          // Attempt profile update
          const { data: updatedProfile, error: profileError } = await supabase
            .from('profiles')
            .update({
              phone: userData.mobile,
              location: `${userData.district || ''}, ${userData.state || ''}`,
              village: userData.village,
              district: userData.district,
              state: userData.state,
              farm_size_acres: userData.farmSize,
              main_crops: userData.mainCrop ? [userData.mainCrop] : []
            })
            .eq('id', data.user.id)
            .select()
            .single();
            
          if (updatedProfile && !profileError) {
            return {
              id: updatedProfile.id,
              name: updatedProfile.name,
              role: updatedProfile.role,
              phone: updatedProfile.phone || '',
              email: updatedProfile.email || '',
              location: updatedProfile.location || '',
              organization: updatedProfile.organization || ''
            };
          }
        }
      } catch (err: any) {
        console.warn("Supabase registration failed, falling back to mock...", err.message);
      }
    }

    // 2. Fallback to authVault secure registration
    const user = await registerUserAccount({
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password || 'Farmer@2026',
      name: userData.name,
      role: userData.role,
      district: userData.district,
      state: userData.state
    });
    
    return user;
  },

  // Marketplace Service - Farmer Produce
  getProduceListings: async (filterCrop?: string): Promise<ProduceListing[]> => {
    try {
      const { data, error } = await supabase
        .from('produce_listings')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data && data.length > 0) {
        let results = data.map(item => ({
          id: item.id,
          farmerId: item.farmer_id,
          farmerName: item.farmer_name,
          crop: item.crop,
          variety: item.variety,
          quantityKg: Number(item.quantity_kg),
          grade: item.grade as any,
          expectedPricePerKg: Number(item.expected_price_per_kg),
          harvestDate: item.harvest_date,
          availabilityDate: item.availability_date,
          location: item.location,
          status: item.status as any
        }));
        
        if (filterCrop && filterCrop !== 'ALL') {
          results = results.filter((l) => l.crop.toLowerCase().includes(filterCrop.toLowerCase()));
        }
        return results;
      }
    } catch {
      // Fallback
    }
    
    await new Promise((res) => setTimeout(res, 150));
    if (filterCrop && filterCrop !== 'ALL') {
      return listingsStore.filter((l) => l.crop.toLowerCase().includes(filterCrop.toLowerCase()));
    }
    return [...listingsStore];
  },

  createProduceListing: async (listing: Omit<ProduceListing, 'id' | 'status'>): Promise<ProduceListing> => {
    try {
      const { data, error } = await supabase
        .from('produce_listings')
        .insert([{
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
          status: 'AVAILABLE'
        }])
        .select()
        .single();
        
      if (!error && data) {
        return {
          ...listing,
          id: data.id,
          status: 'AVAILABLE'
        };
      }
    } catch {
      // Fallback
    }
    
    await new Promise((res) => setTimeout(res, 250));
    const newListing: ProduceListing = {
      ...listing,
      id: `LST-${Date.now().toString().slice(-4)}`,
      status: 'AVAILABLE'
    };
    listingsStore = [newListing, ...listingsStore];
    return newListing;
  },

  deleteProduceListing: async (id: string): Promise<boolean> => {
    try {
      await supabase.from('produce_listings').delete().eq('id', id);
    } catch {
      // Fallback
    }
    listingsStore = listingsStore.filter((l) => l.id !== id);
    return true;
  },

  // Demand Intelligence Service
  getDemandSignals: async (crop = 'Tomato', region = 'Chennai'): Promise<ForecastSignal> => {
    await new Promise((res) => setTimeout(res, 150));
    return {
      ...CHENNAI_TOMATO_FORECAST,
      crop,
      region
    };
  },

  // Demand Service - Buyer Requests & Pooling
  createDemandRequest: async (demand: Omit<DemandRequest, 'id' | 'status' | 'createdAt'>): Promise<DemandRequest> => {
    try {
      const { data, error } = await supabase
        .from('demand_requests')
        .insert([{
          buyer_id: demand.buyerId,
          buyer_name: demand.buyerName,
          buyer_type: demand.buyerType,
          crop: demand.crop,
          quantity_kg: demand.quantityKg,
          quality_requirement: demand.qualityRequirement,
          location: demand.location,
          delivery_date: demand.deliveryDate,
          delivery_time_window: demand.deliveryTimeWindow,
          max_target_price_per_kg: demand.maxTargetPricePerKg,
          status: 'POOLED'
        }])
        .select()
        .single();

      if (!error && data) {
        return {
          ...demand,
          id: data.id,
          status: 'POOLED',
          createdAt: data.created_at
        };
      }
    } catch {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 250));
    const newDemand: DemandRequest = {
      ...demand,
      id: `DEM-${Date.now().toString().slice(-4)}`,
      status: 'POOLED',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    demandsStore = [newDemand, ...demandsStore];
    return newDemand;
  },

  getDemandPools: async (crop?: string): Promise<DemandPool[]> => {
    await new Promise((res) => setTimeout(res, 150));
    if (crop && crop !== 'ALL') {
      return poolsStore.filter((p) => p.crop.toLowerCase() === crop.toLowerCase());
    }
    return [...poolsStore];
  },

  // Matching & Pricing Engine
  runSmartMatching: async (weights?: {
    price: number;
    distance: number;
    quality: number;
    reliability: number;
    capacity: number;
  }): Promise<SmartMatchSupplier[]> => {
    await new Promise((res) => setTimeout(res, 250));
    if (!weights) return SMART_MATCH_SUPPLIERS;

    return SMART_MATCH_SUPPLIERS.map((s) => {
      const calculated = (
        s.priceScore * weights.price +
        s.distanceScore * weights.distance +
        s.qualityScore * weights.quality +
        s.reliabilityScore * weights.reliability +
        s.capacityScore * weights.capacity
      ) / (weights.price + weights.distance + weights.quality + weights.reliability + weights.capacity);

      return {
        ...s,
        totalMatchScore: Number(calculated.toFixed(1))
      };
    }).sort((a, b) => b.totalMatchScore - a.totalMatchScore);
  },

  calculateLandedCostQuote: async (params: {
    farmerPrice: number;
    distanceKm: number;
    quantityKg: number;
  }) => {
    await new Promise((res) => setTimeout(res, 100));
    const transportCostPerKg = Number((2.5 + (params.distanceKm * 0.03)).toFixed(2));
    const packagingCostPerKg = 1.2;
    const platformFeePerKg = 0.8;
    const landedPricePerKg = Number((params.farmerPrice + transportCostPerKg + packagingCostPerKg + platformFeePerKg).toFixed(2));
    const totalOrderCost = Number((landedPricePerKg * params.quantityKg).toFixed(0));
    const farmerNetRealization = Number((params.farmerPrice * params.quantityKg).toFixed(0));
    const realizationPercentage = Number(((farmerNetRealization / totalOrderCost) * 100).toFixed(1));

    return {
      farmerPricePerKg: params.farmerPrice,
      transportCostPerKg,
      packagingCostPerKg,
      platformFeePerKg,
      landedPricePerKg,
      totalOrderCost,
      farmerNetRealization,
      realizationPercentage
    };
  },

  // Logistics & Route Optimization
  optimizeRoute: async (shipmentId: string): Promise<RoutePlan> => {
    await new Promise((res) => setTimeout(res, 300));
    return {
      ...OPTIMIZED_ROUTE_PLAN,
      status: 'SCHEDULED'
    };
  },

  // Traceability & Produce Passport
  getProduceBatchPassport: async (batchId: string): Promise<ProducePassport> => {
    await new Promise((res) => setTimeout(res, 150));
    return {
      ...DEMO_PRODUCE_PASSPORT,
      batchId: batchId || DEMO_PRODUCE_PASSPORT.batchId
    };
  },

  // Settlement Service
  getSettlementRecord: async (orderId: string): Promise<SettlementRecord> => {
    await new Promise((res) => setTimeout(res, 150));
    return {
      ...DEMO_SETTLEMENT,
      orderId: orderId || DEMO_SETTLEMENT.orderId
    };
  }
};
