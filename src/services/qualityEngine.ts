import { 
  CropChecklistConfig, 
  QualityChecklistResult, 
  QualitySampleObservation, 
  QualityVerificationStatus,
  QualityGrade 
} from '../types/quality';

export const CHECKLIST_CONFIGS: Record<string, CropChecklistConfig> = {
  'Tomato': {
    crop: 'Tomato',
    parameters: ['Ripeness', 'Firmness', 'Bruising', 'Cracks', 'Pest damage', 'Uniformity', 'Cleanliness'],
    seriousDefects: ['Rot', 'Severe Pest damage']
  },
  'Banana': {
    crop: 'Banana',
    parameters: ['Maturity', 'Size', 'Black spots', 'Physical damage', 'Bruising', 'Uniformity', 'Cleanliness'],
    seriousDefects: ['Rot', 'Severe Bruising']
  },
  'Rice': {
    crop: 'Rice',
    parameters: ['Cleanliness', 'Visible foreign matter', 'Grain appearance', 'Broken grains', 'Uniformity', 'Visible damage'],
    seriousDefects: ['Mold', 'Severe Infestation']
  },
  'Onion': {
    crop: 'Onion',
    parameters: ['Firmness', 'Sprouting', 'Rot', 'Skin condition', 'Physical damage', 'Uniformity', 'Cleanliness'],
    seriousDefects: ['Rot', 'Extensive Sprouting']
  }
};

export const getChecklistForCrop = (crop: string): CropChecklistConfig => {
  return CHECKLIST_CONFIGS[crop] || {
    crop,
    parameters: ['General Appearance', 'Cleanliness', 'Damage', 'Uniformity'],
    seriousDefects: ['Rot', 'Mold']
  };
};

export const calculateSampleRequirement = (totalQuantityKg: number): number => {
  if (totalQuantityKg <= 100) return 10;
  if (totalQuantityKg <= 500) return 20;
  return 30;
};

export const validateSampleObservation = (obs: QualitySampleObservation): boolean => {
  const sum = obs.good + obs.damaged + obs.immature + obs.rejected;
  return sum === obs.sampleSize;
};

export const calculateQualityScore = (
  checklistResult: QualityChecklistResult,
  sampleObservation: QualitySampleObservation,
  cropConfig: CropChecklistConfig
): { score: number; grade: QualityGrade; hasSeriousDefect: boolean } => {
  // Score breakdown:
  // Base checklist pass rate (max 50 points)
  // Sample good percentage (max 50 points)
  
  let checklistScore = 0;
  let hasSeriousDefect = false;
  let passedParams = 0;
  
  const parameters = Object.keys(checklistResult);
  if (parameters.length > 0) {
    parameters.forEach(param => {
      const res = checklistResult[param];
      if (res === 'PASS') passedParams++;
      if (res === 'SERIOUS_DEFECT') hasSeriousDefect = true;
    });
    checklistScore = (passedParams / parameters.length) * 50;
  } else {
    checklistScore = 50;
  }

  let sampleScore = 0;
  if (sampleObservation.sampleSize > 0) {
    const goodRatio = sampleObservation.good / sampleObservation.sampleSize;
    // slight penalty for damaged or rejected
    const badRatio = (sampleObservation.damaged + sampleObservation.rejected) / sampleObservation.sampleSize;
    
    sampleScore = (goodRatio * 50) - (badRatio * 10);
    if (sampleScore < 0) sampleScore = 0;
  }

  const finalScore = Math.min(100, Math.round(checklistScore + sampleScore));

  let grade: QualityGrade = 'PREMIUM';
  if (finalScore < 60) grade = 'REJECT';
  else if (finalScore < 80) grade = 'STANDARD';
  
  if (hasSeriousDefect) {
    grade = 'REVIEW_REQUIRED';
  }
  
  return {
    score: finalScore,
    grade,
    hasSeriousDefect
  };
};

const VALID_TRANSITIONS: Record<QualityVerificationStatus, QualityVerificationStatus[]> = {
  'SELF_DECLARED': ['COLLECTION_PENDING', 'REVIEW_REQUIRED'],
  'COLLECTION_PENDING': ['COLLECTION_VERIFIED'],
  'COLLECTION_VERIFIED': ['QR_GENERATED', 'DISPUTED'],
  'QR_GENERATED': ['DISPATCHED'],
  'DISPATCHED': ['BUYER_CONFIRMED', 'DISPUTED'],
  'DISPUTED': ['RESOLVED'],
  'REVIEW_REQUIRED': ['COLLECTION_PENDING', 'REJECTED'] as any,
  'RESOLVED': [],
  'BUYER_CONFIRMED': []
};

export const validateTransition = (current: QualityVerificationStatus, next: QualityVerificationStatus): boolean => {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed) return false;
  return allowed.includes(next);
};
