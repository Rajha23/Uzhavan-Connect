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
