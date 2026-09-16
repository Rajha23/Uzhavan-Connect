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

import { supabase } from '../lib/supabase';
import { ApiClient } from './apiClient';

// In-memory fallback store
let listingsStore: ProduceListing[] = [];
let demandsStore: DemandRequest[] = [];
let poolsStore: DemandPool[] = [];

export const apiService = {
  // Authentication & User Service
  login: async (role: UserRole, email?: string, password?: string): Promise<{ token: string; user: UserProfile }> => {
    try {
      // 1. Attempt Supabase Login
      if (email && password && password !== 'SecurePass@2026') {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
          if (profile && !profileError) {
            return {
              token: authData.session.access_token,
              user: {
                id: profile.id,
                name: profile.name,
                role: profile.role,
                phone: profile.phone || '',
                email: profile.email || '',
                location: profile.location || '',
                organization: profile.organization || '',
                village: profile.village,
                district: profile.district,
                state: profile.state,
                farmSizeAcres: profile.farm_size_acres,
                mainCrops: profile.main_crops,
                fpoName: profile.fpo_name
              }
            };
          }
        }
      }
    } catch (err: any) {
      console.warn("Supabase login failed, falling back to mock...", err.message);
    }

    // 2. Fallback Mock Login Logic
    await new Promise((res) => setTimeout(res, 200));

    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    
    // Custom Admin Bypass
    if (email === 'admin@gmail.com' && password === 'admin123') {
      return {
        token: `uzhavanconnect_jwt_admin_${Date.now()}`,
        user: {
          ...DEMO_USERS.ADMIN,
          email: 'admin@gmail.com'
        }
      };
    }

    const matchedUser = mockUsers.find((u: any) => (u.email === email || u.mobile === email) && u.password === password);

    if (matchedUser) {
      const mockToken = `uzhavanconnect_jwt_${matchedUser.profile.role.toLowerCase()}_${Date.now()}`;
      return {
        token: mockToken,
        user: matchedUser.profile
      };
    }

    // Allow demo users with SecurePass@2026
    if (password === 'SecurePass@2026') {
      const roleFallback = DEMO_USERS[role] || DEMO_USERS.FARMER;
      const mockToken = `uzhavanconnect_jwt_${role.toLowerCase()}_${Date.now()}`;

      let displayName = roleFallback.name;
      if (email && email.includes('@')) {
        const raw = email.split('@')[0].split('.')[0].replace(/[0-9_-]/g, ' ').trim();
        displayName = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : email.split('@')[0];
      } else if (email && !/^\+?[0-9\s-]+$/.test(email.trim())) {
        displayName = email.trim().charAt(0).toUpperCase() + email.trim().slice(1);
      }

      return {
        token: mockToken,
        user: {
          ...roleFallback,
          name: displayName,
          email: email?.includes('@') ? email : roleFallback.email,
          phone: email && !email.includes('@') ? email : roleFallback.phone
        }
      };
    }

    throw new Error('Invalid credentials. Please enter the correct email/mobile and password.');
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
    try {
      // 1. Attempt Supabase Registration
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
      
      if (error) throw error;
      
      if (data.user) {
        // Update the profile record created by the trigger
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

    // 2. Fallback Mock Registration Logic
    await new Promise((res) => setTimeout(res, 300));
    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: userData.name || 'New Registered Member',
      role: userData.role || 'FARMER',
      phone: userData.mobile || '+91 90000 00000',
      email: userData.email || 'user@uzhavanconnect.gov.in',
      location: `${userData.district || 'Chengalpattu'}, ${userData.state || 'Tamil Nadu'}`,
      organization: 'Uzhavan Connect Network'
    };

    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    mockUsers.push({
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password,
      profile: newProfile
    });
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

    return newProfile;
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
