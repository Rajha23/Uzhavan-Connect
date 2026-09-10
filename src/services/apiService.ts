/**
 * Uzhavan Connect REST API Service Architecture
 * Now connected to Supabase PostgreSQL & Auth with fallback to demo data
 */

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

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ApiClient } from './apiClient';
import {
  registerUserAccount,
  authenticateCredentials,
  normalizeEmail,
  normalizeRole,
  updateUserProfile,
  getOrCreateProfile,
  authVault
} from './authVault';

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
      throw new Error('Please enter both email and password.');
    }

    const normEmail = normalizeEmail(rawId);
    const isEmail = rawId.includes('@');

    // 1. Primary Source of Truth: Attempt Supabase Auth when configured
    if (isSupabaseConfigured && isEmail) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normEmail,
          password: rawPass
        });

        if (authError) {
          const errMsg = (authError.message || '').toLowerCase();
          if (errMsg.includes('invalid login credentials') || errMsg.includes('invalid credentials')) {
            throw new Error('The email or password is incorrect. Please check your credentials and try again.');
          }
          console.warn('[Supabase Auth] Notice:', authError.message);
        }

        if (authData?.user) {
          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          // Case A Recovery: User exists in Auth, but Profile record is missing
          if (!profile || profileError) {
            console.info(`[Auth Recovery] Auto-recovering missing profile record for auth user ${authData.user.id}...`);
            const meta = authData.user.user_metadata || {};
            const recoveredRole = normalizeRole(meta.role || roleHint || 'FARMER');
            const recoveredName = meta.name || 'Member';
            const recoveredProfile = {
              id: authData.user.id,
              name: recoveredName,
              role: recoveredRole,
              email: normEmail,
              phone: meta.phone || '',
              location: meta.location || 'Tamil Nadu, India',
              organization: meta.organization || (recoveredRole === 'FARMER' ? 'Uzhavan Farmer Collective' : 'Uzhavan Connect Network')
            };

            try {
              const { data: createdRemoteProfile } = await supabase
                .from('profiles')
                .upsert(recoveredProfile)
                .select()
                .single();
              if (createdRemoteProfile) {
                profile = createdRemoteProfile;
              }
            } catch (healErr) {
              console.warn('[Auth Recovery] Remote profile auto-heal warning:', healErr);
            }

            if (!profile) {
              profile = recoveredProfile;
            }
          }

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

          // Cache verified profile locally with identical ID
          getOrCreateProfile(profile.id, userProfile);

          const token = authData.session?.access_token || `uzhavan_jwt_${role.toLowerCase()}_${Date.now()}`;
          ApiClient.setToken(token);
          return { token, user: userProfile };
        }
      } catch (err: any) {
        if (err.message && err.message.includes('incorrect')) {
          throw err;
        }
        console.warn('Supabase auth network notice:', err?.message);
      }
    }

    // 2. Cryptographic Local Credential Vault (Local development / offline mode)
    try {
      const { user, token } = await authenticateCredentials(rawId, rawPass);
      ApiClient.setToken(token);
      return { token, user };
    } catch (vaultErr: any) {
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
    const rawEmail = (userData.email || '').trim();
    const rawMobile = (userData.mobile || '').trim();
    const rawPassword = (userData.password || '').trim();
    const rawName = (userData.name || '').trim();

    if (!rawName) {
      throw new Error('Please enter your full name.');
    }
    if (!rawEmail) {
      throw new Error('Please enter a valid email address.');
    }
    if (!rawMobile || rawMobile.replace(/\D/g, '').length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }
    if (!rawPassword || rawPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const role = normalizeRole(userData.role);
    const normEmail = normalizeEmail(rawEmail);
    let authoritativeUserId: string | undefined;

    // 1. If Supabase is configured, create the user in Supabase Auth & profiles table
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normEmail,
          password: rawPassword,
          options: {
            data: {
              name: rawName,
              role,
              phone: rawMobile,
              district: userData.district,
              state: userData.state
            }
          }
        });

        if (error) {
          const lowerMsg = (error.message || '').toLowerCase();
          if (lowerMsg.includes('already registered') || lowerMsg.includes('already exists')) {
            throw new Error('An account with this email address already exists. Please sign in instead.');
          }
          console.warn('[Supabase SignUp Notice]:', error.message);
        }

        if (data?.user) {
          authoritativeUserId = data.user.id;
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name: rawName,
              role,
              email: normEmail,
              phone: rawMobile,
              location: `${userData.district || ''}, ${userData.state || ''}`,
              village: userData.village,
              district: userData.district,
              state: userData.state,
              farm_size_acres: userData.farmSize,
              main_crops: userData.mainCrop ? [userData.mainCrop] : []
            });
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already exists')) {
          throw err;
        }
        console.warn('Supabase registration sync notice:', err?.message);
      }
    }

    // 2. Store in client Auth Vault with cryptographic salt + SHA-256 hash
    // Enforce 1:1 ID alignment between Auth User ID and Profile
    const newProfile = await registerUserAccount({
      ...userData,
      userId: authoritativeUserId,
      name: rawName,
      email: normEmail,
      mobile: rawMobile,
      password: rawPassword,
      role
    });

    return newProfile;
  },

  // Profile Update Service
  updateProfile: async (
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'role'>>
  ): Promise<UserProfile> => {
    if (!userId) {
      throw new Error('User ID is required to update profile.');
    }

    // 1. If Supabase is configured, update remote database
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone.trim();
        if (updates.location !== undefined) dbUpdates.location = updates.location.trim();
        if (updates.organization !== undefined) dbUpdates.organization = updates.organization.trim();
        if (updates.village !== undefined) dbUpdates.village = updates.village?.trim();
        if (updates.district !== undefined) dbUpdates.district = updates.district?.trim();
        if (updates.state !== undefined) dbUpdates.state = updates.state?.trim();
        if (updates.farmSizeAcres !== undefined) dbUpdates.farm_size_acres = Number(updates.farmSizeAcres);
        if (updates.mainCrops !== undefined) dbUpdates.main_crops = updates.mainCrops;
        if (updates.fpoName !== undefined) dbUpdates.fpo_name = updates.fpoName?.trim();

        const { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', userId);

        if (error) {
          console.warn('[Database Notice] Remote profile update failed:', error.message);
        }
      } catch (err: any) {
        console.warn('[Database Notice] Remote update exception:', err?.message);
      }
    }

    // 2. Update local vault and synchronize session cache
    const updated = updateUserProfile(userId, updates);
    return updated;
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
