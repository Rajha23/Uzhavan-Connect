import { UserRole } from '../types';

export const PUBLIC_TABS: readonly string[] = [
  'home',
  'landing',
  'login',
  'register',
  'traceability',
  'tracking'
] as const;

/**
 * Mapping from URL pathnames to internal tab identifiers.
 * Includes direct URL paths like /farmer, /buyer, /admin, /operations, etc.
 */
export const PATH_TO_TAB: Record<string, string> = {
  '/': 'home',
  '/home': 'home',
  '/landing': 'landing',
  '/login': 'login',
  '/register': 'register',
  '/dashboard': 'dashboard',
  '/farmer': 'farmer',
  '/farmer-dashboard': 'farmer',
  '/my-crops': 'my-crops',
  '/farmer-produce': 'my-crops',
  '/find-buyers': 'find-buyers',
  '/farmer-offers': 'farmer-offers',
  '/cost-simulator': 'cost-simulator',
  '/middleman-sim': 'cost-simulator',
  '/buyer': 'buyer',
  '/buyer-dashboard': 'buyer',
  '/create-demand': 'create-demand',
  '/demand-pool': 'demand-pool',
  '/reverse-auction': 'reverse-auction',
  '/smart-matching': 'smart-matching',
  '/bulk-demand': 'create-demand',
  '/fpo': 'fpo',
  '/fpo-dashboard': 'fpo',
  '/fpo-members': 'fpo',
  '/fpo-produce': 'my-crops',
  '/operations': 'logistics',
  '/logistics': 'logistics',
  '/logistics-dashboard': 'logistics',
  '/shipments': 'shipments',
  '/routes': 'routes',
  '/route-optimization': 'route-optimization',
  '/delivery': 'shipments',
  '/hubs': 'hubs',
  '/admin': 'admin',
  '/admin-dashboard': 'admin',
  '/sys-users': 'sys-users',
  '/roles-permissions': 'roles-permissions',
  '/system-monitoring': 'system-monitoring',
  '/gov-users': 'sys-users',
  '/gov-farmers': 'sys-users',
  '/gov-buyers': 'sys-users',
  '/gov-fpos': 'sys-users',
  '/gov-price-trends': 'demand-intel',
  '/orders': 'orders',
  '/settlement': 'settlement',
  '/traceability': 'traceability',
  '/tracking': 'traceability',
  '/profile': 'profile',
  '/reports': 'reports',
  '/impact-kpis': 'reports',
  '/analytics': 'reports',
  '/demand-intel': 'demand-intel',
  '/demand-forecast': 'demand-forecast',
  '/access-denied': 'access-denied'
};

/**
 * Mapping from internal tab identifiers to canonical URL pathnames.
 */
export const TAB_TO_PATH: Record<string, string> = {
  home: '/',
  landing: '/home',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  farmer: '/farmer',
  buyer: '/buyer',
  fpo: '/fpo',
  logistics: '/operations',
  admin: '/admin',
  'my-crops': '/my-crops',
  'find-buyers': '/find-buyers',
  'farmer-offers': '/farmer-offers',
  'cost-simulator': '/cost-simulator',
  'create-demand': '/create-demand',
  'demand-pool': '/demand-pool',
  'reverse-auction': '/reverse-auction',
  'smart-matching': '/smart-matching',
  shipments: '/shipments',
  routes: '/routes',
  'route-optimization': '/route-optimization',
  hubs: '/hubs',
  orders: '/orders',
  settlement: '/settlement',
  traceability: '/traceability',
  profile: '/profile',
  reports: '/reports',
  'demand-intel': '/demand-intel',
  'demand-forecast': '/demand-forecast',
  'sys-users': '/admin/users',
  'roles-permissions': '/admin/roles',
  'system-monitoring': '/admin/monitoring',
  'access-denied': '/access-denied'
};

/**
 * Role-Based Access Control matrix.
 * Defines which tabs are authorized for each canonical UserRole.
 */
export const ROLE_ROUTE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  FARMER: [
    'home',
    'landing',
    'login',
    'register',
    'dashboard',
    'farmer',
    'my-crops',
    'find-buyers',
    'farmer-offers',
    'cost-simulator',
    'demand-forecast',
    'orders',
    'settlement',
    'traceability',
    'tracking',
    'profile',
    'access-denied'
  ],
  RETAIL_BUYER: [
    'home',
    'landing',
    'login',
    'register',
    'dashboard',
    'buyer',
    'create-demand',
    'demand-pool',
    'reverse-auction',
    'smart-matching',
    'orders',
    'traceability',
    'tracking',
    'profile',
    'access-denied'
  ],
  FPO_AGGREGATOR: [
    'home',
    'landing',
    'login',
    'register',
    'dashboard',
    'fpo',
    'my-crops',
    'demand-forecast',
    'demand-intel',
    'orders',
    'settlement',
    'reports',
    'traceability',
    'tracking',
    'profile',
    'access-denied'
  ],
  LOGISTICS: [
    'home',
    'landing',
    'login',
    'register',
    'dashboard',
    'logistics',
    'shipments',
    'routes',
    'route-optimization',
    'hubs',
    'orders',
    'traceability',
    'tracking',
    'profile',
    'access-denied'
  ],
  ADMIN: [
    'home',
    'landing',
    'login',
    'register',
    'dashboard',
    'admin',
    'demand-intel',
    'smart-matching',
    'shipments',
    'routes',
    'route-optimization',
    'hubs',
    'orders',
    'settlement',
    'reports',
    'sys-users',
    'roles-permissions',
    'system-monitoring',
    'traceability',
    'tracking',
    'profile',
    'access-denied'
  ]
};

/**
 * Human-readable feature names for AccessDenied notification.
 */
export const TAB_FEATURE_NAMES: Record<string, string> = {
  farmer: 'Farmer Portal & Dashboard',
  'my-crops': 'Farmer Crop Listings & Produce Inventory',
  'find-buyers': 'Farmer Buyer Discovery & Match Offers',
  'farmer-offers': 'Farmer Matched Trade Offers',
  'cost-simulator': 'Middleman Net Realization Simulator',
  buyer: 'Institutional Buyer Portal & Dashboard',
  'create-demand': 'Institutional Buyer Demand Creation',
  'demand-pool': 'Demand Aggregation Pools',
  'reverse-auction': 'Institutional Reverse Auction',
  'smart-matching': 'Algorithmic Smart Matching Engine',
  fpo: 'FPO Aggregator Operations Portal',
  logistics: 'Logistics Fleet & Dispatch Management',
  shipments: 'Cold-Chain Shipments & Manifests',
  routes: 'Transit Routes & Corridors',
  'route-optimization': 'VRP Vehicle Route Optimization',
  hubs: 'Dynamic Micro-Hub Network',
  admin: 'Platform Operations & System Administration',
  'sys-users': 'System User & Directory Management',
  'roles-permissions': 'RBAC Roles & Security Permissions',
  'system-monitoring': 'Real-Time System Monitoring & Health',
  reports: 'Executive Analytics & Impact Reports',
  settlement: 'Automated Instant Farmer Settlement',
  'demand-intel': 'Demand Forecasting & Market Intelligence'
};

/**
 * Human-readable display label for authenticated roles.
 */
export const ROLE_DISPLAY_LABELS: Record<UserRole, string> = {
  FARMER: 'FARMER',
  RETAIL_BUYER: 'BUYER',
  FPO_AGGREGATOR: 'FPO',
  LOGISTICS: 'OPERATIONS',
  ADMIN: 'ADMIN'
};

/**
 * Visual styling tokens for informational role badges.
 */
export const ROLE_BADGE_STYLES: Record<UserRole, { dot: string; bg: string; border: string; text: string }> = {
  FARMER: {
    dot: 'bg-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900'
  },
  RETAIL_BUYER: {
    dot: 'bg-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900'
  },
  FPO_AGGREGATOR: {
    dot: 'bg-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900'
  },
  LOGISTICS: {
    dot: 'bg-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900'
  },
  ADMIN: {
    dot: 'bg-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900'
  }
};

/**
 * Validates whether a specific tab is authorized for the given role.
 */
export const isRouteAuthorized = (role: UserRole, tab: string): boolean => {
  if (PUBLIC_TABS.includes(tab)) return true;
  const allowed = ROLE_ROUTE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(tab);
};

/**
 * Resolves an incoming pathname (e.g. from window.location.pathname) into an internal tab identifier.
 * Strips leading/trailing slashes and normalizes lowercase.
 */
export const getTabFromPath = (pathname: string): string => {
  if (!pathname || pathname === '/') return 'home';
  const cleanPath = pathname.toLowerCase().trim();
  
  // Exact match
  if (PATH_TO_TAB[cleanPath]) {
    return PATH_TO_TAB[cleanPath];
  }

  // Suffix matching (e.g. /app/buyer or /buyer/)
  const normalized = '/' + cleanPath.replace(/^\/+|\/+$/g, '');
  if (PATH_TO_TAB[normalized]) {
    return PATH_TO_TAB[normalized];
  }

  // Base segment matching
  const segment = normalized.split('/')[1];
  if (segment && PATH_TO_TAB['/' + segment]) {
    return PATH_TO_TAB['/' + segment];
  }

  return 'dashboard';
};

/**
 * Resolves an internal tab into its canonical URL pathname.
 */
export const getPathFromTab = (tab: string): string => {
  return TAB_TO_PATH[tab] || `/${tab}`;
};

/**
 * Resolves the primary dashboard tab for a given role.
 */
export const getAuthorizedDashboardTab = (role: UserRole): string => {
  switch (role) {
    case 'RETAIL_BUYER':
      return 'buyer';
    case 'FPO_AGGREGATOR':
      return 'fpo';
    case 'LOGISTICS':
      return 'logistics';
    case 'ADMIN':
      return 'admin';
    case 'FARMER':
    default:
      return 'farmer';
  }
};
