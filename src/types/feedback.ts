// ─── Feedback Intelligence System — Type Definitions ─────────────────────────

export type FeedbackSentiment = 'positive' | 'negative' | 'neutral' | 'mixed';
export type FeedbackType = 'feedback' | 'complaint' | 'suggestion';
export type FeedbackPriority = 'high' | 'medium' | 'low';
export type FeedbackCategory =
  | 'product_quality'
  | 'freshness'
  | 'delivery'
  | 'packaging'
  | 'payment'
  | 'pricing'
  | 'farmer_reliability'
  | 'buyer_reliability'
  | 'communication'
  | 'app_experience'
  | 'fpo_hub'
  | 'demand_forecasting'
  | 'other';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'ACTION_TAKEN'
  | 'RESOLVED'
  | 'USER_CONFIRMED'
  | 'CLOSED';

export type UserFeedbackType = 'buyer' | 'farmer' | 'bulk_buyer' | 'fpo' | 'logistics';

// ─── Star Ratings (multidimensional) ─────────────────────────────────────────

export interface FeedbackRatings {
  // Buyer → Farmer/Order ratings
  quality?: number;
  freshness?: number;
  quantity?: number;
  delivery?: number;
  packaging?: number;
  value?: number;
  farmerReliability?: number;
  overall?: number;
  // Farmer → Buyer ratings
  communication?: number;
  paymentReliability?: number;
  orderReliability?: number;
  cancellationBehaviour?: number;
  pickupCooperation?: number;
  overallBuyerExperience?: number;
  // Delivery specific
  deliveryTimeRating?: number;
  deliveryProfessionalism?: number;
  // Platform ratings (farmer platform feedback)
  orderProcess?: number;
  paymentProcess?: number;
  pickupDelivery?: number;
  cropRecommendations?: number;
  priceRecommendations?: number;
  fpoHubExperience?: number;
  overallPlatform?: number;
}

// ─── AI Analysis Output ───────────────────────────────────────────────────────

export interface AiFeedbackAnalysis {
  sentiment: FeedbackSentiment;
  feedbackType: FeedbackType;
  categories: FeedbackCategory[];
  issues: string[];
  priority: FeedbackPriority;
  confidence: number; // 0.0 – 1.0
  detectedKeywords: string[];
  possibleRootCause: string;
  recommendedAction: string;
  repeatedIssueFlag: boolean;
  patternAlert?: string;
}

// ─── Core Feedback Item ───────────────────────────────────────────────────────

export interface FeedbackItem {
  feedbackId: string;
  userId: string;
  userType: UserFeedbackType;
  orderId?: string;
  farmerId?: string;
  farmerName?: string;
  buyerId?: string;
  buyerName?: string;
  microHubId?: string;
  microHubName?: string;
  deliveryId?: string;
  productName?: string;
  // Ratings
  ratings: FeedbackRatings;
  // Content
  comment?: string;
  photoUrl?: string;
  tags: string[];
  // Classification
  category: FeedbackCategory;
  subcategory?: string;
  sentiment: FeedbackSentiment;
  feedbackType: FeedbackType;
  priority: FeedbackPriority;
  // AI
  aiConfidence: number;
  aiAnalysis: AiFeedbackAnalysis;
  // Status / Lifecycle
  status: ComplaintStatus;
  adminResponse?: string;
  adminNotes?: string;
  assignedTeam?: string;
  assignedTo?: string;
  resolution?: string;
  recommendedAction?: string;
  // Location
  area?: string;
  zone?: string;
  // Gamification
  pointsAwarded?: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  // Delivery specifics
  deliveryOnTime?: boolean;
  deliveryDamaged?: boolean;
  deliveryPackagingOk?: boolean;
  deliveryProfessional?: boolean;
  orderComplete?: boolean;
}

// ─── Complaint (extends FeedbackItem for anytime complaints) ──────────────────

export interface ComplaintItem extends FeedbackItem {
  feedbackType: 'complaint';
  complaintTitle: string;
  urgency: 'immediate' | 'within_24h' | 'within_week';
  evidencePhotos: string[];
  contactRequested: boolean;
  escalated: boolean;
  escalatedAt?: string;
  escalatedReason?: string;
  resolutionDeadline?: string;
  userConfirmedResolution?: boolean;
}

// ─── Pattern Detection Result ─────────────────────────────────────────────────

export interface PatternAlert {
  alertId: string;
  alertType: 'farmer' | 'buyer' | 'product' | 'microhub' | 'area' | 'category' | 'trend';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedEntity: string; // farmer name, hub name, area, etc.
  affectedEntityId?: string;
  occurrenceCount: number;
  timeframe: string;
  category?: FeedbackCategory;
  suggestedAction: string;
  detectedAt: string;
  isNew: boolean;
}

// ─── Root Cause Analysis ──────────────────────────────────────────────────────

export interface RootCauseChain {
  symptom: string;
  category: string;
  subIssue: string;
  trigger: string;
  rootCause: string;
  suggestedFix: string;
}

// ─── Location Intelligence ────────────────────────────────────────────────────

export interface AreaFeedbackSummary {
  area: string;
  zone: string;
  microHub?: string;
  totalFeedback: number;
  avgRating: number;
  deliveryRating: number;
  qualityRating: number;
  complaintCount: number;
  mainIssue: string;
  sentiment: FeedbackSentiment;
  trend: 'improving' | 'worsening' | 'stable';
}

// ─── Farmer Trust & Recognition ───────────────────────────────────────────────

export type FarmerBadgeType =
  | 'TRUSTED_FARMER'
  | 'TOP_RATED'
  | 'FRESHNESS_CHAMPION'
  | 'QUALITY_CHAMPION'
  | 'RELIABLE_SUPPLIER'
  | 'RISING_STAR';

export interface FarmerTrustProfile {
  farmerId: string;
  farmerName: string;
  totalReviews: number;
  avgOverallRating: number;
  avgQualityRating: number;
  avgFreshnessRating: number;
  avgDeliveryRating: number;
  complaintCount: number;
  positivePercentage: number;
  badges: FarmerBadgeType[];
  trend: 'improving' | 'worsening' | 'stable';
  lastReviewDate: string;
  area?: string;
}

// ─── "You Said, We Improved" Story ───────────────────────────────────────────

export interface ImprovementStory {
  storyId: string;
  userFeedback: string; // What users said
  actionTaken: string; // What was done
  result: string; // Measurable outcome
  category: FeedbackCategory;
  impact: string; // e.g., "24% reduction in delivery time"
  impactMetric?: number;
  impactUnit?: string;
  date: string;
  affectedUsers: number;
  icon: string; // emoji
}

// ─── Analytics Summary (for admin dashboard) ──────────────────────────────────

export interface FeedbackAnalyticsSummary {
  totalFeedback: number;
  avgRating: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
  openComplaints: number;
  highPriorityCount: number;
  resolutionRate: number;
  avgResolutionHours: number;
  feedbackByCategory: { category: string; count: number; avgRating: number }[];
  trendData: { period: string; count: number; avgRating: number; complaints: number }[];
  patternAlerts: PatternAlert[];
  areaIntelligence: AreaFeedbackSummary[];
  topFarmers: FarmerTrustProfile[];
}

// ─── Feedback Form State ──────────────────────────────────────────────────────

export interface BuyerFeedbackFormState {
  orderId: string;
  ratings: FeedbackRatings;
  selectedTags: string[];
  comment: string;
  feedbackType: FeedbackType;
  photoFile?: File | null;
  deliveryOnTime: boolean;
  deliveryDamaged: boolean;
  deliveryPackagingOk: boolean;
  deliveryProfessional: boolean;
  orderComplete: boolean;
}

export interface ComplaintFormState {
  category: FeedbackCategory;
  title: string;
  description: string;
  orderId: string;
  urgency: 'immediate' | 'within_24h' | 'within_week';
  photoFile?: File | null;
  contactRequested: boolean;
}

// ─── Notification related to Feedback ────────────────────────────────────────

export interface FeedbackNotification {
  notificationId: string;
  recipientId: string;
  recipientRole: string;
  type:
    | 'complaint_submitted'
    | 'complaint_under_review'
    | 'complaint_resolved'
    | 'new_feedback_received'
    | 'rating_improved'
    | 'high_priority_alert'
    | 'pattern_detected'
    | 'delivery_complaint_spike';
  title: string;
  message: string;
  relatedFeedbackId?: string;
  isRead: boolean;
  createdAt: string;
}
