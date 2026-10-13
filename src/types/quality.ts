export type QualityVerificationStatus = 
  | 'SELF_DECLARED'
  | 'COLLECTION_PENDING'
  | 'COLLECTION_VERIFIED'
  | 'REVIEW_REQUIRED'
  | 'QR_GENERATED'
  | 'DISPATCHED'
  | 'BUYER_CONFIRMED'
  | 'DISPUTED'
  | 'RESOLVED';

export type VerificationConfidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type QualityGrade = 'PREMIUM' | 'STANDARD' | 'REJECT' | 'REVIEW_REQUIRED';

export interface QualitySampleObservation {
  sampleSize: number;
  good: number;
  damaged: number;
  immature: number;
  rejected: number;
}

export interface CropChecklistConfig {
  crop: string;
  parameters: string[];
  seriousDefects: string[];
}

export interface QualityChecklistResult {
  [parameter: string]: 'PASS' | 'FAIL' | 'SERIOUS_DEFECT';
}

export interface BatchVersion {
  version: number;
  quantityKg: number;
  reason: string;
  changedBy: string;
  timestamp: string;
}

export interface BatchAuditLog {
  action: string;
  userId: string;
  role: string;
  previousStatus: QualityVerificationStatus | null;
  newStatus: QualityVerificationStatus;
  reason?: string;
  timestamp: string;
}

export interface QualityVerificationRecord {
  status: QualityVerificationStatus;
  confidence: VerificationConfidence;
  batchId?: string;
  qrCodeUrl?: string;
  
  // Verification payload
  sampleObservation?: QualitySampleObservation;
  checklistResult?: QualityChecklistResult;
  calculatedScore?: number;
  grade: QualityGrade;
  hasSeriousDefect: boolean;
  
  verifiedAt?: string;
  verifiedBy?: string;
  
  versions: BatchVersion[];
  auditLog: BatchAuditLog[];
}

export type BuyerConfirmationStatus = 
  | 'ACCEPTED_AS_GRADED'
  | 'ACCEPTED_WITH_MINOR_ISSUE'
  | 'PARTIALLY_ACCEPTED'
  | 'QUALITY_MISMATCH'
  | 'QUANTITY_MISMATCH'
  | 'REJECTED';

export interface BuyerConfirmation {
  status: BuyerConfirmationStatus;
  reason?: string;
  reportedQuantity?: number;
  timestamp: string;
}

export interface QualityDispute {
  disputeId: string;
  batchId: string;
  buyerId: string;
  reason: string;
  reportedQuantity?: number;
  expectedQuantity: number;
  reportedQuality: string;
  expectedGrade: QualityGrade;
  description: string;
  timestamp: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
}

export type VerificationDisplayLabel =
  | 'Farmer-declared'
  | 'Collection-verified'
  | 'Buyer-confirmed'
  | 'Mixed verification status'
  | 'Under Review';

export interface VerificationDisplayInfo {
  status: QualityVerificationStatus | 'MIXED';
  label: VerificationDisplayLabel;
  shortLabel: string;
  meaning: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconType: 'self' | 'verified' | 'buyer' | 'mixed' | 'pending';
}

export const getVerificationDisplayInfo = (
  status?: QualityVerificationStatus | 'MIXED' | string
): VerificationDisplayInfo => {
  switch (status) {
    case 'COLLECTION_VERIFIED':
    case 'QR_GENERATED':
    case 'DISPATCHED':
      return {
        status: 'COLLECTION_VERIFIED',
        label: 'Collection-verified',
        shortLabel: 'Verified',
        meaning: 'Information checked during the collection process, with the verification scope documented.',
        badgeBg: 'bg-emerald-50',
        badgeBorder: 'border-emerald-300',
        badgeText: 'text-emerald-800',
        iconType: 'verified'
      };
    case 'BUYER_CONFIRMED':
      return {
        status: 'BUYER_CONFIRMED',
        label: 'Buyer-confirmed',
        shortLabel: 'Confirmed',
        meaning: 'The buyer has confirmed the specified details or receipt upon physical handover.',
        badgeBg: 'bg-blue-50',
        badgeBorder: 'border-blue-300',
        badgeText: 'text-blue-800',
        iconType: 'buyer'
      };
    case 'MIXED':
      return {
        status: 'MIXED',
        label: 'Mixed verification status',
        shortLabel: 'Mixed Status',
        meaning: 'Aggregated supply lot composed of multiple farmer contributions with varying verification levels.',
        badgeBg: 'bg-amber-50',
        badgeBorder: 'border-amber-300',
        badgeText: 'text-amber-800',
        iconType: 'mixed'
      };
    case 'COLLECTION_PENDING':
    case 'REVIEW_REQUIRED':
      return {
        status: 'REVIEW_REQUIRED',
        label: 'Under Review',
        shortLabel: 'Review',
        meaning: 'Verification in progress by field agent or aggregation hub inspector.',
        badgeBg: 'bg-purple-50',
        badgeBorder: 'border-purple-300',
        badgeText: 'text-purple-800',
        iconType: 'pending'
      };
    case 'SELF_DECLARED':
    default:
      return {
        status: 'SELF_DECLARED',
        label: 'Farmer-declared',
        shortLabel: 'Self-declared',
        meaning: 'Information provided by the farmer but not independently verified.',
        badgeBg: 'bg-amber-50/80',
        badgeBorder: 'border-amber-300/80',
        badgeText: 'text-amber-900',
        iconType: 'self'
      };
  }
};
