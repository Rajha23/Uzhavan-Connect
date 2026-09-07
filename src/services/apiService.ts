/**
 * Uzhavan Connect REST API Service Architecture
 * Directly connects to Spring Boot 3.x REST APIs & Python FastAPI Microservices
 * Features resilient graceful fallback to demo state for offline evaluation
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

import { ApiClient } from './apiClient';

// In-memory fallback store
let listingsStore: ProduceListing[] = [];
let demandsStore: DemandRequest[] = [];
let poolsStore: DemandPool[] = [];

export const apiService = {
  // Authentication & User Service
  login: async (role: UserRole, email?: string, password?: string): Promise<{ token: string; user: UserProfile }> => {
    try {
      const authRes = await ApiClient.post<{
        token: string;
        userId: string;
        name: string;
        email: string;
        role: UserRole;
      }>('/auth/login', {
        identifier: email || `${role.toLowerCase()}@uzhavanconnect.gov.in`,
        password: password || 'SecurePass@2026'
      });
      ApiClient.setToken(authRes.token);
      return {
        token: authRes.token,
        user: {
          id: authRes.userId,
          name: authRes.name,
          role: authRes.role,
          phone: '+91 94441 23456',
          email: authRes.email,
          location: 'Tamil Nadu, India',
          organization: `${authRes.role} Federation`
        }
      };
    } catch (err: any) {
      await new Promise((res) => setTimeout(res, 200));

      const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const matchedUser = mockUsers.find((u: any) => (u.email === email || u.mobile === email) && u.password === password);

      if (matchedUser) {
        const mockToken = `uzhavanconnect_jwt_${matchedUser.profile.role.toLowerCase()}_${Date.now()}`;
        ApiClient.setToken(mockToken);
        return {
          token: mockToken,
          user: matchedUser.profile
        };
      }

      // Allow demo users with SecurePass@2026
      if (password === 'SecurePass@2026') {
        const roleFallback = DEMO_USERS[role] || DEMO_USERS.FARMER;
        const mockToken = `uzhavanconnect_jwt_${role.toLowerCase()}_${Date.now()}`;
        ApiClient.setToken(mockToken);

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
    try {
      const res = await ApiClient.post<{
        token: string;
        userId: string;
        name: string;
        email: string;
        mobile: string;
        role: UserRole;
      }>('/auth/register', {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: userData.password || 'Farmer@2026',
        role: userData.role,
        village: userData.village || 'Maduranthakam',
        district: userData.district || 'Chengalpattu',
        state: userData.state || 'Tamil Nadu',
        pincode: userData.pincode || '603306',
        mainCrop: userData.mainCrop || 'Tomato',
        farmSize: userData.farmSize || 3.5
      });
      ApiClient.setToken(res.token);
      return {
        id: res.userId,
        name: res.name,
        role: res.role,
        phone: res.mobile,
        email: res.email,
        location: `${userData.district || 'Chengalpattu'}, ${userData.state || 'Tamil Nadu'}`,
        organization: `${res.role} Member`
      };
    } catch {
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
    }
  },

  // Marketplace Service - Farmer Produce
  getProduceListings: async (filterCrop?: string): Promise<ProduceListing[]> => {
    try {
      const data = await ApiClient.get<any[]>('/produce');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          id: item.id?.toString() || `LST-${Math.random()}`,
          farmerId: item.farmer?.id?.toString() || 'FARM-001',
          farmerName: item.farmer?.name || 'Local Producer',
          crop: item.crop,
          variety: 'Hybrid F1',
          quantityKg: Number(item.quantity),
          grade: (item.quality || 'Grade A') as any,
          expectedPricePerKg: Number(item.expectedPrice),
          harvestDate: item.availableDate || '2026-09-08',
          availabilityDate: item.availableDate || '2026-09-08',
          location: item.location || 'Chengalpattu',
          status: item.status || 'AVAILABLE'
        }));
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
      const saved = await ApiClient.post<any>('/produce', {
        crop: listing.crop,
        quantity: listing.quantityKg,
        expectedPrice: listing.expectedPricePerKg,
        quality: listing.grade,
        availableDate: listing.availabilityDate,
        location: listing.location
      });
      return {
        ...listing,
        id: saved.id?.toString() || `LST-${Date.now().toString().slice(-4)}`,
        status: 'AVAILABLE'
      };
    } catch {
      await new Promise((res) => setTimeout(res, 250));
      const newListing: ProduceListing = {
        ...listing,
        id: `LST-${Date.now().toString().slice(-4)}`,
        status: 'AVAILABLE'
      };
      listingsStore = [newListing, ...listingsStore];
      return newListing;
    }
  },

  deleteProduceListing: async (id: string): Promise<boolean> => {
    try {
      await ApiClient.delete(`/produce/${id}`);
    } catch {
      // Fallback
    }
    listingsStore = listingsStore.filter((l) => l.id !== id);
    return true;
  },

  // Demand Intelligence Service
  getDemandSignals: async (crop = 'Tomato', region = 'Chennai'): Promise<ForecastSignal> => {
    try {
      const fc = await ApiClient.get<any>(`/forecasts?product=${encodeURIComponent(crop)}`);
      if (Array.isArray(fc) && fc.length > 0) {
        const item = fc[0];
        return {
          ...CHENNAI_TOMATO_FORECAST,
          crop: item.product,
          region: item.location,
          predictedDemandKg: Number(item.predictedQuantity),
          confidenceScore: Math.round(Number(item.confidence) * 100)
        };
      }
    } catch {
      // Fallback
    }
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
      const created = await ApiClient.post<any>('/demands', {
        product: demand.crop,
        quantity: demand.quantityKg,
        location: demand.location,
        requiredDate: demand.deliveryDate,
        quality: demand.qualityRequirement
      });
      return {
        ...demand,
        id: created.id?.toString() || `DEM-${Date.now().toString().slice(-4)}`,
        status: 'POOLED',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
    } catch {
      await new Promise((res) => setTimeout(res, 250));
      const newDemand: DemandRequest = {
        ...demand,
        id: `DEM-${Date.now().toString().slice(-4)}`,
        status: 'POOLED',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      demandsStore = [newDemand, ...demandsStore];
      return newDemand;
    }
  },

  getDemandPools: async (crop?: string): Promise<DemandPool[]> => {
    try {
      const pools = await ApiClient.get<any[]>('/demand-pools');
      if (Array.isArray(pools) && pools.length > 0) {
        return pools.map((p) => ({
          id: p.id?.toString() || 'POOL-001',
          crop: p.product,
          region: p.location,
          totalQuantityKg: Number(p.totalQuantity),
          demandRequests: [],
          targetDate: p.requiredDate,
          forecastQuantityKg: Math.round(Number(p.totalQuantity) * 1.1),
          buyersCount: 4,
          status: 'POOLED' as const,
          priceBenchmarkPerKg: 26.5
        }));
      }
    } catch {
      // Fallback
    }
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
    try {
      const matches = await ApiClient.get<any[]>('/matches');
      if (Array.isArray(matches) && matches.length > 0) {
        return matches.map((m, idx) => ({
          id: m.id?.toString() || `SMS-${idx + 1}`,
          supplierName: m.farmer?.name || 'Chengalpattu Lead Farmers Federation',
          supplierType: 'FPO' as const,
          crop: m.demand?.product || 'Tomato',
          availableQtyKg: Number(m.quantity || 3200),
          allocatedQtyKg: Number(m.quantity || 3000),
          distanceKm: Number(m.distance || 35),
          offeredPricePerKg: Number(m.price || 24.5),
          qualityGrade: 'Grade A' as const,
          reliabilityScore: Number(m.reliabilityScore || 94),
          capacityScore: Number(m.capacityScore || 88),
          qualityScore: Number(m.qualityScore || 90),
          priceScore: 92,
          distanceScore: 95,
          totalMatchScore: Number(m.matchScore || 92.4),
          hubProximity: '5 km to Chengalpattu Hub #4',
          status: 'RECOMMENDED' as const
        }));
      }
    } catch {
      // Fallback
    }

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
    try {
      const res = await ApiClient.post<any>('/routes/optimize', { shipmentId });
      if (res && res.routeSequence) {
        return {
          ...OPTIMIZED_ROUTE_PLAN,
          id: res.id?.toString() || 'RT-OPT-2026',
          totalDistanceKm: Number(res.distance) || 42.5,
          utilizationPercentage: Number(res.vehicleUtilization) || 91.4,
          status: 'SCHEDULED'
        };
      }
    } catch {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 300));
    return {
      ...OPTIMIZED_ROUTE_PLAN,
      status: 'SCHEDULED'
    };
  },

  // Traceability & Produce Passport
  getProduceBatchPassport: async (batchId: string): Promise<ProducePassport> => {
    try {
      const batch = await ApiClient.get<any>(`/batches/${encodeURIComponent(batchId)}`);
      if (batch && batch.batchCode) {
        return {
          ...DEMO_PRODUCE_PASSPORT,
          batchId: batch.batchCode,
          crop: batch.product,
          harvestDate: batch.harvestDate,
          collectionHub: batch.collectionCenter,
          qualityGrade: (batch.quality || 'Grade A') as any
        };
      }
    } catch {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 150));
    return {
      ...DEMO_PRODUCE_PASSPORT,
      batchId: batchId || DEMO_PRODUCE_PASSPORT.batchId
    };
  },

  // Settlement Service
  getSettlementRecord: async (orderId: string): Promise<SettlementRecord> => {
    try {
      const settlements = await ApiClient.get<any[]>('/settlements');
      if (Array.isArray(settlements) && settlements.length > 0) {
        const s = settlements[0];
        return {
          ...DEMO_SETTLEMENT,
          id: s.id?.toString() || 'STL-001',
          orderId: orderId || 'ORD-2026-9921',
          totalOrderValue: Number(s.grossAmount) || 84000,
          farmerAmount: Number(s.netFarmerAmount) || 77700,
          logisticsAmount: Number(s.transportCost) || 3360,
          platformAmount: Number(s.platformCost) || 1260
        };
      }
    } catch {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 150));
    return {
      ...DEMO_SETTLEMENT,
      orderId: orderId || DEMO_SETTLEMENT.orderId
    };
  }
};
