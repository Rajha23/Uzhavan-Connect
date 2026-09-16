// ─── Feedback AI Analysis Service ────────────────────────────────────────────
// Simulates an NLP/LLM-based classifier for hackathon demonstration.
// Architecture is designed so a real FastAPI + LLM backend can be plugged
// in by replacing these functions with API calls.

import {
  AiFeedbackAnalysis,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackSentiment,
  FeedbackType,
  FeedbackItem,
  PatternAlert,
} from '../types/feedback';

// ─── Keyword Dictionaries ─────────────────────────────────────────────────────

const POSITIVE_KEYWORDS = [
  'fresh', 'excellent', 'perfect', 'great', 'good', 'amazing', 'wonderful',
  'best', 'love', 'happy', 'satisfied', 'clean', 'reliable', 'professional',
  'on time', 'fast', 'quick', 'well packed', 'nice', 'quality', 'recommend',
  'superb', 'outstanding', 'fantastic', 'impressed', 'pleased', 'better',
  'improved', 'healthy', 'crisp', 'pure', 'genuine', 'transparent',
  // Tamil transliteration
  'nalla', 'super', 'romba nalla',
];

const NEGATIVE_KEYWORDS = [
  'rotten', 'damaged', 'spoiled', 'wilted', 'bad', 'wrong', 'missing',
  'late', 'delay', 'delayed', 'incomplete', 'broken', 'torn', 'fraud',
  'fake', 'cheated', 'refund', 'unacceptable', 'terrible', 'horrible',
  'disgusting', 'smelly', 'mouldy', 'expired', 'old', 'stale', 'cancelled',
  'cancel', 'disappointed', 'never again', 'poor', 'awful', 'worst',
  'missing', 'short', 'less quantity', 'payment', 'not received',
];

const NEUTRAL_KEYWORDS = [
  'okay', 'ok', 'average', 'normal', 'alright', 'decent', 'acceptable',
  'could be better', 'needs improvement', 'suggestion', 'consider',
];

const COMPLAINT_TRIGGERS = [
  'rotten', 'damaged', 'fraud', 'fake', 'wrong', 'missing', 'refund',
  'complaint', 'not acceptable', 'never again', 'short', 'mouldy',
  'spoiled', 'wilted', 'expired', 'cheated', 'payment issue', 'not paid',
];

const SUGGESTION_TRIGGERS = [
  'could be', 'should be', 'would be better', 'suggest', 'recommendation',
  'improve', 'consider', 'please add', 'wish', 'feature', 'make it easier',
  'simpler', 'faster',
];

// ─── Category Detection ───────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<FeedbackCategory, string[]> = {
  product_quality: ['quality', 'produce', 'vegetable', 'product', 'condition', 'bad quality', 'good quality', 'wrong product'],
  freshness: ['fresh', 'rotten', 'wilted', 'stale', 'old', 'mouldy', 'expired', 'spoiled', 'smell'],
  delivery: ['delivery', 'deliver', 'late', 'delay', 'on time', 'fast', 'slow', 'hour', 'wait', 'driver'],
  packaging: ['packaging', 'package', 'bag', 'torn', 'spill', 'broken', 'sealed', 'box'],
  payment: ['payment', 'pay', 'paid', 'refund', 'money', 'amount', 'price', 'charge', 'bill'],
  pricing: ['price', 'expensive', 'cheap', 'value', 'worth', 'cost', 'rate'],
  farmer_reliability: ['farmer', 'reliable', 'honest', 'trustworthy', 'professional', 'communication'],
  buyer_reliability: ['buyer', 'cancel', 'cancellation', 'no show', 'unprofessional', 'unreliable'],
  communication: ['communication', 'response', 'reply', 'contact', 'call', 'message', 'informed'],
  app_experience: ['app', 'platform', 'website', 'interface', 'ui', 'ux', 'login', 'navigation', 'feature', 'bug'],
  fpo_hub: ['hub', 'fpo', 'collection', 'centre', 'center', 'micro hub', 'pickup'],
  demand_forecasting: ['forecast', 'demand', 'prediction', 'availability', 'stock', 'plan'],
  other: [],
};

// ─── Priority Rules ───────────────────────────────────────────────────────────

const HIGH_PRIORITY_TRIGGERS = [
  'rotten', 'fraud', 'fake', 'mouldy', 'spoiled', 'not paid', 'payment issue',
  'wrong product', 'missing', 'cheated', 'health', 'sick', 'poison',
];

const MEDIUM_PRIORITY_TRIGGERS = [
  'late', 'delay', 'delayed', 'damaged', 'torn', 'wilted', 'short', 'less',
  'communication', 'packaging issue', 'cancel',
];

// ─── Core Analysis Function ───────────────────────────────────────────────────

export function analyzeFeedback(
  comment: string,
  tags: string[],
  ratings: Record<string, number | undefined>,
  existingFeedback: FeedbackItem[],
  farmerId?: string,
  buyerId?: string,
  microHubId?: string
): AiFeedbackAnalysis {
  const text = (comment + ' ' + tags.join(' ')).toLowerCase();

  // 1. Sentiment Analysis
  const positiveMatches = POSITIVE_KEYWORDS.filter((k) => text.includes(k)).length;
  const negativeMatches = NEGATIVE_KEYWORDS.filter((k) => text.includes(k)).length;
  const avgRating = Object.values(ratings).filter(Boolean).reduce((a: number, b) => a + (b as number), 0) /
    (Object.values(ratings).filter(Boolean).length || 1);

  let sentiment: FeedbackSentiment;
  if (avgRating >= 4 && positiveMatches > negativeMatches) {
    sentiment = 'positive';
  } else if (avgRating <= 2 && negativeMatches > positiveMatches) {
    sentiment = 'negative';
  } else if (positiveMatches > 0 && negativeMatches > 0) {
    sentiment = 'mixed';
  } else if (avgRating >= 3.5) {
    sentiment = 'positive';
  } else if (avgRating < 2.5) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  // 2. Feedback Type Classification
  let feedbackType: FeedbackType = 'feedback';
  if (COMPLAINT_TRIGGERS.some((k) => text.includes(k)) || avgRating <= 2) {
    feedbackType = 'complaint';
  } else if (SUGGESTION_TRIGGERS.some((k) => text.includes(k))) {
    feedbackType = 'suggestion';
  } else if (sentiment === 'negative' && negativeMatches >= 2) {
    feedbackType = 'complaint';
  }

  // 3. Category Detection
  const categories: FeedbackCategory[] = [];
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) {
      categories.push(cat as FeedbackCategory);
    }
  }
  if (categories.length === 0) categories.push('other');

  // 4. Priority Assignment
  let priority: FeedbackPriority = 'low';
  if (HIGH_PRIORITY_TRIGGERS.some((k) => text.includes(k)) || avgRating <= 1.5) {
    priority = 'high';
  } else if (MEDIUM_PRIORITY_TRIGGERS.some((k) => text.includes(k)) || avgRating <= 2.5) {
    priority = 'medium';
  } else if (feedbackType === 'complaint') {
    priority = 'medium';
  }

  // 5. Detected Keywords
  const detectedKeywords = [
    ...POSITIVE_KEYWORDS.filter((k) => text.includes(k)),
    ...NEGATIVE_KEYWORDS.filter((k) => text.includes(k)),
  ].slice(0, 5);

  // 6. Pattern / Repeated Issue Detection
  let repeatedIssueFlag = false;
  let patternAlert: string | undefined;

  if (farmerId) {
    const farmerComplaints = existingFeedback.filter(
      (f) => f.farmerId === farmerId && f.feedbackType === 'complaint' && f.category === categories[0]
    );
    if (farmerComplaints.length >= 2) {
      repeatedIssueFlag = true;
      patternAlert = `Farmer has ${farmerComplaints.length + 1} similar complaints. Pattern detected.`;
    }
  }
  if (microHubId) {
    const hubComplaints = existingFeedback.filter(
      (f) => f.microHubId === microHubId && f.category === 'delivery' && f.feedbackType === 'complaint'
    );
    if (hubComplaints.length >= 3) {
      repeatedIssueFlag = true;
      patternAlert = patternAlert || `This hub has ${hubComplaints.length + 1} delivery complaints. Hub pattern detected.`;
    }
  }
  if (buyerId) {
    const buyerCancellations = existingFeedback.filter(
      (f) => f.buyerId === buyerId && f.category === 'buyer_reliability'
    );
    if (buyerCancellations.length >= 2) {
      repeatedIssueFlag = true;
      patternAlert = patternAlert || `Buyer has ${buyerCancellations.length + 1} reliability complaints.`;
    }
  }

  // 7. Root Cause & Recommended Action
  const rootCause = deriveRootCause(categories, text, priority);
  const recommendedAction = deriveRecommendedAction(categories, priority, feedbackType, repeatedIssueFlag, farmerId, microHubId);

  // 8. Confidence Score (simulated)
  const confidence = Math.min(0.99, 0.78 + (detectedKeywords.length * 0.04) + (Math.random() * 0.08));

  return {
    sentiment,
    feedbackType,
    categories,
    issues: categories.map((c) => c.replace(/_/g, ' ')),
    priority,
    confidence: parseFloat(confidence.toFixed(2)),
    detectedKeywords,
    possibleRootCause: rootCause,
    recommendedAction,
    repeatedIssueFlag,
    patternAlert,
  };
}

// ─── Root Cause Derivation ────────────────────────────────────────────────────

function deriveRootCause(categories: FeedbackCategory[], text: string, priority: FeedbackPriority): string {
  if (categories.includes('freshness') && text.includes('rotten')) {
    return 'Cold-chain temperature exceedance or produce dispatched past optimal harvest window.';
  }
  if (categories.includes('delivery') && text.includes('late')) {
    return 'Peak-hour route congestion or insufficient delivery capacity at local Micro Hub.';
  }
  if (categories.includes('packaging')) {
    return 'Packaging material quality insufficient or improper sealing during hub packing.';
  }
  if (categories.includes('product_quality') && priority === 'high') {
    return 'Farmer-level quality control inadequate. Possible harvest-timing or storage issues.';
  }
  if (categories.includes('payment')) {
    return 'Payment processing pipeline delay or system reconciliation issue.';
  }
  if (categories.includes('buyer_reliability')) {
    return 'Buyer lacks order commitment. No cancellation penalty structure in place.';
  }
  if (categories.includes('app_experience')) {
    return 'User experience friction in current ordering flow.';
  }
  if (categories.includes('pricing')) {
    return 'Price volatility not communicated clearly to buyers before checkout.';
  }
  return 'Further investigation required to identify root cause.';
}

// ─── Recommended Action Derivation ───────────────────────────────────────────

function deriveRecommendedAction(
  categories: FeedbackCategory[],
  priority: FeedbackPriority,
  feedbackType: FeedbackType,
  repeated: boolean,
  farmerId?: string,
  microHubId?: string
): string {
  if (priority === 'high') {
    if (categories.includes('freshness')) return 'Initiate immediate refund process. Mandatory cold-chain audit for supplier and hub.';
    if (categories.includes('payment')) return 'Escalate to finance team. Initiate refund/payment correction within 24 hours.';
    if (categories.includes('product_quality')) return 'Quality team to investigate. Flag farmer for inspection before next dispatch.';
  }
  if (repeated && farmerId) return `Flag farmer for mandatory pre-dispatch quality inspection. Admin review of farmer account.`;
  if (repeated && microHubId) return `Operations team to audit Micro Hub delivery capacity and routing.`;
  if (feedbackType === 'complaint' && categories.includes('delivery')) return 'Review delivery scheduling and route allocation. Consider adding delivery slot.';
  if (feedbackType === 'complaint' && categories.includes('packaging')) return 'Inspect packaging materials at hub. Review sealing SOP.';
  if (feedbackType === 'suggestion') return 'Forward to product/operations team for review and scheduling.';
  if (feedbackType === 'feedback' && categories.includes('farmer_reliability')) return 'Acknowledge positive feedback. Notify farmer and consider recognition badge.';
  return 'Review feedback and take appropriate action based on category.';
}

// ─── Pattern Detection Across All Feedback ────────────────────────────────────

export function detectPatterns(feedbackItems: FeedbackItem[]): PatternAlert[] {
  const alerts: PatternAlert[] = [];
  const now = new Date().toISOString();

  // Hub-level delivery pattern
  const hubDeliveryMap: Record<string, FeedbackItem[]> = {};
  feedbackItems.forEach((f) => {
    if (f.microHubId && f.category === 'delivery' && f.feedbackType === 'complaint') {
      if (!hubDeliveryMap[f.microHubId]) hubDeliveryMap[f.microHubId] = [];
      hubDeliveryMap[f.microHubId].push(f);
    }
  });
  for (const [hubId, items] of Object.entries(hubDeliveryMap)) {
    if (items.length >= 3) {
      alerts.push({
        alertId: `PA-HUB-${hubId}`,
        alertType: 'microhub',
        severity: items.length >= 6 ? 'high' : 'medium',
        title: `Delivery complaint spike — ${items[0].microHubName || hubId}`,
        description: `${items.length} delivery complaints linked to ${items[0].microHubName || hubId} in recent period.`,
        affectedEntity: items[0].microHubName || hubId,
        affectedEntityId: hubId,
        occurrenceCount: items.length,
        timeframe: 'Last 14 days',
        category: 'delivery',
        suggestedAction: 'Audit delivery capacity and routing at this hub. Consider additional delivery staff.',
        detectedAt: now,
        isNew: true,
      });
    }
  }

  // Farmer-level quality pattern
  const farmerQualityMap: Record<string, FeedbackItem[]> = {};
  feedbackItems.forEach((f) => {
    if (f.farmerId && (f.category === 'product_quality' || f.category === 'freshness') && f.feedbackType === 'complaint') {
      if (!farmerQualityMap[f.farmerId]) farmerQualityMap[f.farmerId] = [];
      farmerQualityMap[f.farmerId].push(f);
    }
  });
  for (const [farmerId, items] of Object.entries(farmerQualityMap)) {
    if (items.length >= 2) {
      alerts.push({
        alertId: `PA-FARM-${farmerId}`,
        alertType: 'farmer',
        severity: items.length >= 4 ? 'high' : 'medium',
        title: `Repeated quality complaints — ${items[0].farmerName || farmerId}`,
        description: `${items.length} quality complaints from farmer ${items[0].farmerName || farmerId}.`,
        affectedEntity: items[0].farmerName || farmerId,
        affectedEntityId: farmerId,
        occurrenceCount: items.length,
        timeframe: 'Last 30 days',
        category: 'product_quality',
        suggestedAction: 'Schedule mandatory quality inspection before next dispatch.',
        detectedAt: now,
        isNew: items.length >= 4,
      });
    }
  }

  // Area-level trend
  const areaMap: Record<string, FeedbackItem[]> = {};
  feedbackItems.forEach((f) => {
    if (f.area) {
      if (!areaMap[f.area]) areaMap[f.area] = [];
      areaMap[f.area].push(f);
    }
  });
  for (const [area, items] of Object.entries(areaMap)) {
    const complaints = items.filter((f) => f.feedbackType === 'complaint');
    if (complaints.length >= 4 && items.length > 0) {
      const complaintRate = complaints.length / items.length;
      if (complaintRate > 0.4) {
        alerts.push({
          alertId: `PA-AREA-${area.replace(/\s+/g, '-')}`,
          alertType: 'area',
          severity: complaintRate > 0.6 ? 'high' : 'medium',
          title: `High complaint rate — ${area}`,
          description: `${Math.round(complaintRate * 100)}% of feedback from ${area} are complaints (${complaints.length} of ${items.length}).`,
          affectedEntity: area,
          occurrenceCount: complaints.length,
          timeframe: 'All time',
          suggestedAction: 'Investigate systemic issues in this area. Conduct quality and logistics audit.',
          detectedAt: now,
          isNew: false,
        });
      }
    }
  }

  return alerts;
}

// ─── Sentiment Summary ────────────────────────────────────────────────────────

export function getSentimentSummary(feedbackItems: FeedbackItem[]) {
  const total = feedbackItems.length;
  if (total === 0) return { positive: 0, neutral: 0, negative: 0, mixed: 0 };
  const counts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
  feedbackItems.forEach((f) => { counts[f.sentiment]++; });
  return {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
    mixed: Math.round((counts.mixed / total) * 100),
  };
}

// ─── Average Rating Calculator ────────────────────────────────────────────────

export function getAverageRating(feedbackItems: FeedbackItem[]): number {
  const rated = feedbackItems.filter((f) => f.ratings.overall !== undefined);
  if (rated.length === 0) return 0;
  const sum = rated.reduce((acc, f) => acc + (f.ratings.overall || 0), 0);
  return parseFloat((sum / rated.length).toFixed(1));
}
