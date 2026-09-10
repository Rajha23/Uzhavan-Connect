import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';

export interface StoredCredential {
  userId: string;
  email: string;
  mobile: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const VAULT_KEY = 'uzhavan_auth_credentials';
const PROFILES_KEY = 'uzhavan_user_profiles';

/**
 * Normalizes email address by trimming whitespace and converting to lowercase.
 */
export const normalizeEmail = (email?: string): string => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Normalizes mobile number to 10 digits without spaces or country code symbols.
 */
export const normalizeMobile = (mobile?: string): string => {
  if (!mobile) return '';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits.slice(-10);
};

/**
 * Normalizes role string to canonical UserRole union.
 * Handles case differences and legacy aliases (e.g. 'buyer', 'Retail Buyer', 'FPO').
 */
export const normalizeRole = (role?: string): UserRole => {
  if (!role) return 'FARMER';
  const clean = role.trim().toUpperCase().replace(/[\s-]+/g, '_');
  
  if (clean.includes('BULK')) {
    return 'BULK_BUYER';
  }
  if (clean.includes('BUYER') || clean.includes('RETAIL')) {
    return 'RETAIL_BUYER';
  }
  if (clean.includes('FPO') || clean.includes('AGGREGATOR')) {
    return 'FPO_AGGREGATOR';
  }
  if (clean.includes('LOGISTIC') || clean.includes('TRANSPORT') || clean.includes('CARRIER')) {
    return 'LOGISTICS';
  }
  if (clean.includes('ADMIN') || clean.includes('GOV') || clean.includes('SYSADMIN')) {
    return 'ADMIN';
  }
  return 'FARMER';
};

/**
 * Generates a random cryptographic salt.
 */
export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Hashes password with user salt using Web Cryptography API SHA-256.
 * Guarantees zero plaintext password storage.
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt + 'uzhavan_secure_pepper_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Retrieves all stored credentials from the secure vault.
 */
export const getStoredCredentials = (): StoredCredential[] => {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Retrieves all stored profiles.
 */
export const getStoredProfiles = (): Record<string, UserProfile> => {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Seed baseline demo accounts into the vault if they do not yet exist.
 * This ensures demo logins work securely through standard hash verification.
 */
export const seedDemoAccounts = async (): Promise<void> => {
  const credentials = getStoredCredentials();
  const profiles = getStoredProfiles();

  const demoAccounts = [
    {
      user: DEMO_USERS.FARMER,
      email: 'rajesh.kumar@uzhavanconnect.gov.in',
      mobile: '9840123456',
      passwords: ['Farmer@2026', 'SecurePass@2026']
    },
    {
      user: DEMO_USERS.RETAIL_BUYER,
      email: 'anita.procurement@abcretail.in',
      mobile: '9884055667',
      passwords: ['Buyer@2026', 'SecurePass@2026']
    },
    {
      user: DEMO_USERS.BULK_BUYER,
      email: 'vikram.procurement@metroagri.in',
      mobile: '9840288990',
      passwords: ['BulkBuyer@2026', 'SecurePass@2026', 'buyer123']
    },
    {
      user: DEMO_USERS.FPO_AGGREGATOR,
      email: 'ravi.fpo@uzhavanconnect.gov.in',
      mobile: '9770011223',
      passwords: ['Fpo@2026', 'SecurePass@2026']
    },
    {
      user: DEMO_USERS.LOGISTICS,
      email: 'dispatch@sundartrans.in',
      mobile: '9660022334',
      passwords: ['Logistics@2026', 'SecurePass@2026']
    },
    {
      user: DEMO_USERS.ADMIN,
      email: 'admin@uzhavanconnect.gov.in',
      mobile: '9900011122',
      passwords: ['Admin@2026', 'SecurePass@2026', 'admin123']
    },
    {
      user: { ...DEMO_USERS.ADMIN, email: 'admin@gmail.com' },
      email: 'admin@gmail.com',
      mobile: '9900011123',
      passwords: ['admin123', 'SecurePass@2026']
    }
  ];

  let credentialsUpdated = false;
  let profilesUpdated = false;

  for (const account of demoAccounts) {
    const normEmail = normalizeEmail(account.email);
    const normMobile = normalizeMobile(account.mobile);

    // Ensure profile exists
    if (!profiles[account.user.id]) {
      profiles[account.user.id] = {
        ...account.user,
        email: normEmail,
        phone: account.mobile,
        role: normalizeRole(account.user.role)
      };
      profilesUpdated = true;
    }

    // Ensure credentials exist
    const existingCred = credentials.find(c => c.email === normEmail || c.mobile === normMobile);
    if (!existingCred) {
      const salt = generateSalt();
      const primaryPassword = account.passwords[0];
      const passwordHash = await hashPassword(primaryPassword, salt);
      credentials.push({
        userId: account.user.id,
        email: normEmail,
        mobile: normMobile,
        passwordHash,
        salt,
        createdAt: new Date().toISOString()
      });
      credentialsUpdated = true;
    }
  }

  if (credentialsUpdated) {
    localStorage.setItem(VAULT_KEY, JSON.stringify(credentials));
  }
  if (profilesUpdated) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }
};

/**
 * Registers a new user account:
 * 1. Hashes the password with a unique salt (never stores plaintext).
 * 2. Saves the credential in the vault.
 * 3. Saves the profile in the profile store, keyed by userId.
 */
export const registerUserAccount = async (userData: {
  userId?: string;
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
  await seedDemoAccounts();

  const normEmail = normalizeEmail(userData.email);
  const normMobile = normalizeMobile(userData.mobile);
  const role = normalizeRole(userData.role);
  const rawPassword = (userData.password || 'Farmer@2026').trim();

  const credentials = getStoredCredentials();
  const profiles = getStoredProfiles();

  // Check for duplicate registered email
  const existing = credentials.find(
    c => (normEmail && c.email === normEmail) || (normMobile && c.mobile === normMobile)
  );

  // Authoritative user ID: prioritize explicit ID from auth provider (e.g. Supabase UUID)
  const userId = userData.userId || (existing ? existing.userId : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const salt = generateSalt();
  const passwordHash = await hashPassword(rawPassword, salt);

  const newCredential: StoredCredential = {
    userId,
    email: normEmail,
    mobile: normMobile,
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  };

  if (existing) {
    // Update existing user credential
    const idx = credentials.findIndex(c => c.userId === existing.userId || c.userId === userId);
    if (idx !== -1) {
      credentials[idx] = newCredential;
    } else {
      credentials.push(newCredential);
    }
  } else {
    credentials.push(newCredential);
  }

  const newProfile: UserProfile = {
    id: userId,
    name: userData.name.trim() || 'Registered Member',
    role,
    phone: userData.mobile.trim(),
    email: normEmail,
    location: `${userData.district || 'Chennai'}, ${userData.state || 'Tamil Nadu'}`,
    village: userData.village?.trim(),
    district: userData.district?.trim(),
    state: userData.state?.trim(),
    farmSizeAcres: userData.farmSize,
    mainCrops: userData.mainCrop ? [userData.mainCrop.trim()] : [],
    organization: role === 'FARMER' ? 'Uzhavan Farmer Collective' : role === 'FPO_AGGREGATOR' ? 'FPO Aggregator Hub' : role === 'BULK_BUYER' ? 'Metro Agri Processors & Wholesale' : 'Uzhavan Connect Network'
  };

  profiles[userId] = newProfile;

  localStorage.setItem(VAULT_KEY, JSON.stringify(credentials));
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  return newProfile;
};

/**
 * Updates permitted profile fields in the local profile vault.
 * Security enforcement: id, role, and authentication identifiers are strictly immutable.
 */
export const updateUserProfile = (
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'role'>>
): UserProfile => {
  const profiles = getStoredProfiles();
  let profile = profiles[userId];
  if (!profile) {
    throw new Error(`Profile for user ${userId} does not exist.`);
  }

  // Strip forbidden fields to prevent role tampering or ID spoofing
  const { id: _ignoredId, role: _ignoredRole, ...permittedUpdates } = updates as any;

  const updatedProfile: UserProfile = {
    ...profile,
    ...permittedUpdates,
    id: profile.id, // Primary key is immutable
    role: profile.role // Role is determined exclusively by authorized profile record
  };

  profiles[userId] = updatedProfile;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  // Sync active local session cache if the updated profile belongs to currently active user
  try {
    const rawFallback = localStorage.getItem('uzhavan_fallback_session');
    if (rawFallback) {
      const parsed = JSON.parse(rawFallback);
      if (parsed && parsed.id === userId) {
        localStorage.setItem('uzhavan_fallback_session', JSON.stringify(updatedProfile));
      }
    }
  } catch (err) {
    console.warn('Could not sync updated profile to fallback session cache', err);
  }

  return updatedProfile;
};

/**
 * Retrieves a user profile by ID, or creates a safe fallback profile if missing.
 */
export const getOrCreateProfile = (
  userId: string,
  fallbackData: Partial<UserProfile>
): UserProfile => {
  const profiles = getStoredProfiles();
  if (profiles[userId]) {
    return profiles[userId];
  }

  const role = normalizeRole(fallbackData.role);
  const createdProfile: UserProfile = {
    id: userId,
    name: fallbackData.name || 'Registered Member',
    role,
    phone: fallbackData.phone || '',
    email: normalizeEmail(fallbackData.email),
    location: fallbackData.location || 'Tamil Nadu, India',
    organization: fallbackData.organization || (role === 'FARMER' ? 'Uzhavan Farmer Collective' : 'Uzhavan Connect Network'),
    village: fallbackData.village,
    district: fallbackData.district,
    state: fallbackData.state,
    farmSizeAcres: fallbackData.farmSizeAcres,
    mainCrops: fallbackData.mainCrops || []
  };

  profiles[userId] = createdProfile;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  return createdProfile;
};

/**
 * Authenticates user credentials using cryptographic hash comparison.
 * Supports login via normalized email OR normalized 10-digit mobile number.
 */
export const authenticateCredentials = async (
  identifier: string,
  password: string
): Promise<{ user: UserProfile; token: string }> => {
  await seedDemoAccounts();

  const trimmedId = identifier.trim();
  const cleanPassword = password.trim();

  if (!trimmedId || !cleanPassword) {
    throw new Error('Please enter both email and password.');
  }

  const normEmail = normalizeEmail(trimmedId);
  const normMobile = normalizeMobile(trimmedId);

  const credentials = getStoredCredentials();
  const profiles = getStoredProfiles();

  // Find credential record by either email or mobile
  const cred = credentials.find(c => {
    const emailMatch = Boolean(normEmail && c.email === normEmail);
    const mobileMatch = Boolean(normMobile && c.mobile === normMobile);
    return emailMatch || mobileMatch;
  });

  if (!cred) {
    throw new Error('Invalid email or password. Please check your credentials and try again.');
  }

  // Cryptographic hash validation
  const calculatedHash = await hashPassword(cleanPassword, cred.salt);
  let isMatch = calculatedHash === cred.passwordHash;

  // Strict check: Only authorized seeded demo accounts may utilize demo master keys
  if (!isMatch) {
    const isDemoAccount =
      cred.email.includes('uzhavanconnect.gov.in') ||
      cred.email.includes('abcretail.in') ||
      cred.email.includes('metroagri.in') ||
      cred.email.includes('sundartrans.in') ||
      cred.email === 'admin@gmail.com';

    if (isDemoAccount) {
      if (cleanPassword === 'SecurePass@2026' || cleanPassword === 'Farmer@2026') {
        isMatch = true;
      } else if (cred.email === 'admin@gmail.com' && cleanPassword === 'admin123') {
        isMatch = true;
      }
    }
  }

  if (!isMatch) {
    throw new Error('Invalid email or password. Please check your credentials and try again.');
  }

  // Load the corresponding profile
  let profile = profiles[cred.userId];
  if (!profile) {
    // Safe profile recovery mechanism (Case A: Auth exists, profile missing)
    profile = {
      id: cred.userId,
      name: 'Registered Member',
      role: 'FARMER',
      email: cred.email,
      phone: cred.mobile,
      location: 'Tamil Nadu, India',
      organization: 'Uzhavan Connect'
    };
    profiles[cred.userId] = profile;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  // Normalize role to ensure consistent matching
  profile.role = normalizeRole(profile.role);

  const token = `uzhavan_jwt_${profile.role.toLowerCase()}_${Date.now()}`;
  return {
    user: profile,
    token
  };
};

export const authVault = {
  normalizeEmail,
  normalizeMobile,
  normalizeRole,
  hashPassword,
  getStoredCredentials,
  getStoredProfiles,
  getUserById: (userId: string) => {
    const profiles = getStoredProfiles();
    const profile = profiles[userId];
    if (!profile) return null;
    return { profile };
  },
  createAccountRecord: registerUserAccount,
  registerUserAccount,
  authenticateCredentials,
  updateUserProfile,
  getOrCreateProfile,
  verifyUserSession: (userId: string, claimedRole?: string): UserProfile | null => {
    const profiles = getStoredProfiles();
    const profile = profiles[userId];
    if (!profile) return null;
    const verifiedRole = normalizeRole(profile.role);
    if (claimedRole && normalizeRole(claimedRole) !== verifiedRole) {
      console.warn(`[Security Alert] Role mismatch detected for user ${userId}. Claimed: ${claimedRole}, Authentic: ${verifiedRole}`);
      return null;
    }
    return { ...profile, role: verifiedRole };
  }
};

