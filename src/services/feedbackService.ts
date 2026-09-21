import {
  FeedbackItem,
  StructuredFeedbackCategory,
  FeedbackIssueType,
  FeedbackProcessingStatus,
  FeedbackResponse,
  UserFeedbackType
} from '../types/feedback';

const FEEDBACK_STORAGE_KEY = 'uzhavan_transaction_feedback_v2';

export const INITIAL_TRANSACTION_FEEDBACKS: FeedbackItem[] = [
  {
    feedbackId: 'FB-TXN-001',
    userId: 'usr_retail_1',
    userType: 'buyer',
    submittedByRole: 'RETAIL_BUYER',
    submittedByName: 'Reliance Fresh Procurement',
    orderId: 'ORD-TOMATO-01',
    transactionId: 'ORD-TOMATO-01',
    shipmentId: 'SHP-TN-5510',
    productName: 'Tomato (Sivam Hybrid)',
    farmerId: 'usr_farmer_1',
    farmerName: 'Ramu (Kallakurichi Pasumai FPO)',
    buyerId: 'usr_retail_1',
    buyerName: 'Reliance Fresh',
    logisticsProvider: 'Sundar Transport & Cold Chain',
    rating: 5,
    ratings: { overall: 5, quality: 5, freshness: 5, packaging: 5, delivery: 4 },
    category: 'product_quality',
    structuredCategory: 'Product Quality',
    whatWentWell: 'Superb firmness and sugar brix (5.2°). Tamper-evident crates arrived perfectly sealed without any bruising.',
    whatCouldBeImproved: 'Can advance delivery by 30 mins to align with our morning receiving shifts.',
    issueType: 'No issue',
    additionalComments: 'Consistently high grade quality from Chinnasalem cluster. Highly recommended.',
    sentiment: 'positive',
    feedbackType: 'feedback',
    priority: 'low',
    status: 'RESOLVED',
    processingStatus: 'Resolved',
    responses: [
      {
        id: 'RESP-001',
        responderId: 'usr_farmer_1',
        responderName: 'Ramu (Pasumai FPO)',
        responderRole: 'FARMER',
        message: 'Thank you Reliance Fresh team! Our farmers harvested at 5:30 AM to maintain peak firmness.',
        createdAt: '15 Sep 2026, 09:10 AM'
      }
    ],
    internalNotes: 'Grade A verified. Payment auto-settled via Escrow.',
    aiConfidence: 0.96,
    aiAnalysis: {
      sentiment: 'positive',
      feedbackType: 'feedback',
      categories: ['product_quality', 'freshness', 'packaging'],
      issues: [],
      priority: 'low',
      confidence: 0.96,
      detectedKeywords: ['firmness', 'brix', 'sealed', 'quality'],
      possibleRootCause: 'Standard adherence',
      recommendedAction: 'Award Freshness Champion point to Pasumai FPO',
      repeatedIssueFlag: false
    },
    tags: ['High Quality', 'Grade A', 'Timely'],
    createdAt: '2026-09-15T08:30:00.000Z',
    updatedAt: '2026-09-15T09:10:00.000Z',
    resolvedAt: '2026-09-15T09:10:00.000Z',
    resolvedBy: 'System Auto-Resolution'
  },
  {
    feedbackId: 'FB-TXN-002',
    userId: 'usr_bulk_2',
    userType: 'bulk_buyer',
    submittedByRole: 'BULK_BUYER',
    submittedByName: 'Aachi Spices Export Terminal',
    orderId: 'ORD-TURMERIC-03',
    transactionId: 'ORD-TURMERIC-03',
    shipmentId: 'SHP-TN-1020',
    productName: 'Turmeric (Erode Local Finger)',
    farmerId: 'usr-farmer-03',
    farmerName: 'Meenakshi Sundaram',
    buyerId: 'usr_bulk_2',
    buyerName: 'Aachi Spices',
    logisticsProvider: 'Sundar Transport & Cold Chain',
    rating: 5,
    ratings: { overall: 5, quality: 5, packaging: 5, value: 5 },
    category: 'product_quality',
    structuredCategory: 'Product Quality',
    whatWentWell: 'Curcumin content tested above 4.8%. Moisture kept strictly under 10%. Excellent post-harvest curing.',
    issueType: 'No issue',
    additionalComments: 'Approved for export consignment to Middle East.',
    sentiment: 'positive',
    feedbackType: 'feedback',
    priority: 'low',
    status: 'RESOLVED',
    processingStatus: 'Resolved',
    responses: [],
    internalNotes: 'Laboratory export certificate verified.',
    aiConfidence: 0.94,
    aiAnalysis: {
      sentiment: 'positive',
      feedbackType: 'feedback',
      categories: ['product_quality'],
      issues: [],
      priority: 'low',
      confidence: 0.94,
      detectedKeywords: ['curcumin', 'moisture', 'export'],
      possibleRootCause: 'Good post-harvest management',
      recommendedAction: 'Mark supplier as Premium Certified',
      repeatedIssueFlag: false
    },
    tags: ['Export Grade', 'High Curcumin'],
    createdAt: '2026-09-14T11:00:00.000Z',
    updatedAt: '2026-09-14T11:00:00.000Z',
    resolvedAt: '2026-09-14T11:00:00.000Z',
    resolvedBy: 'Admin Quality Team'
  },
  {
    feedbackId: 'FB-TXN-003',
    userId: 'usr_retail_2',
    userType: 'buyer',
    submittedByRole: 'RETAIL_BUYER',
    submittedByName: 'Nilgiris Supermarket Receiving Dock',
    orderId: 'ORD-CHILLI-04',
    transactionId: 'ORD-CHILLI-04',
    shipmentId: 'SHP-TN-8822',
    productName: 'Green Chilli (G4 Sharp Pungent)',
    farmerId: 'usr_farmer_4',
    farmerName: 'Alagarsamy Farmers Producer Group',
    buyerId: 'usr_retail_2',
    buyerName: 'Nilgiris Supermarket',
    logisticsProvider: 'Sundar Transport & Cold Chain',
    rating: 3,
    ratings: { overall: 3, quality: 4, delivery: 2, packaging: 4 },
    category: 'delivery',
    structuredCategory: 'Delivery',
    whatWentWell: 'Reefer container kept temperature at 5.0°C so produce arrived fresh despite detour.',
    whatCouldBeImproved: 'Carrier was delayed by 2.5 hours without proactive phone communication to our receiving bay.',
    issueType: 'Delivery delay',
    additionalComments: 'Driver cited NH-83 monsoon route diversion.',
    sentiment: 'mixed',
    feedbackType: 'complaint',
    priority: 'medium',
    status: 'UNDER_REVIEW',
    processingStatus: 'Under Review',
    responses: [
      {
        id: 'RESP-003',
        responderId: 'usr-logistics-01',
        responderName: 'Sundar Logistics Control Tower',
        responderRole: 'LOGISTICS',
        message: 'We sincerely apologize for the delay. NH-83 experienced an emergency bridge diversion during the monsoon downpour. Telematics protocol has been updated to automatically send SMS updates to receiving bays.',
        createdAt: 'Today, 10:20 AM'
      }
    ],
    internalNotes: 'GPS sensor confirmed reefer maintained 5.0°C throughout. Telematics delay alert was delayed by 20m. System notification trigger reviewed.',
    aiConfidence: 0.89,
    aiAnalysis: {
      sentiment: 'mixed',
      feedbackType: 'complaint',
      categories: ['delivery'],
      issues: ['Delay in arrival', 'Notification gap'],
      priority: 'medium',
      confidence: 0.89,
      detectedKeywords: ['delayed', 'detour', 'fresh', 'communication'],
      possibleRootCause: 'Monsoon highway diversion & automated SMS lag',
      recommendedAction: 'Automate proactive dockside delay notifications',
      repeatedIssueFlag: false
    },
    tags: ['Delivery Delay', 'Weather Detour'],
    createdAt: '2026-09-15T09:45:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const feedbackService = {
  loadFeedbacks(): FeedbackItem[] {
    try {
      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse feedbacks from localStorage', e);
    }
    // Seed initial demo data
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTION_FEEDBACKS));
    } catch {}
    return [...INITIAL_TRANSACTION_FEEDBACKS];
  },

  saveFeedbacks(items: FeedbackItem[]) {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('transaction-feedback-updated'));
    } catch (e) {
      console.warn('Failed to save feedbacks to localStorage', e);
    }
  },

  getFeedbacksForUser(userId?: string, role?: string): FeedbackItem[] {
    const all = this.loadFeedbacks();
    if (!userId || role === 'ADMIN') return all;

    return all.filter((f) => {
      if (f.userId === userId) return true;
      if (f.farmerId === userId && (role === 'FARMER' || role === 'FPO_AGGREGATOR')) return true;
      if (f.buyerId === userId && (role === 'RETAIL_BUYER' || role === 'BULK_BUYER')) return true;
      if (role === 'LOGISTICS' && (f.category === 'delivery' || f.structuredCategory === 'Delivery' || f.shipmentId)) return true;
      return false;
    });
  },

  getFeedbackForTransaction(transactionId: string, userId?: string): FeedbackItem | undefined {
    const all = this.loadFeedbacks();
    return all.find((f) => {
      const matchTxn = f.transactionId === transactionId || f.orderId === transactionId || f.shipmentId === transactionId;
      if (!matchTxn) return false;
      if (userId && f.userId !== userId) return false;
      return true;
    });
  },

  hasSubmittedFeedback(transactionId: string, userId: string): boolean {
    const all = this.loadFeedbacks();
    return all.some((f) => {
      const matchTxn = f.transactionId === transactionId || f.orderId === transactionId || f.shipmentId === transactionId;
      return matchTxn && f.userId === userId;
    });
  },

  submitFeedback(item: Omit<FeedbackItem, 'feedbackId' | 'createdAt' | 'updatedAt' | 'aiAnalysis' | 'aiConfidence' | 'tags'> & { feedbackId?: string }): FeedbackItem {
    const all = this.loadFeedbacks();
    const id = item.feedbackId || `FB-TXN-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    const ratingVal = item.rating || 5;
    const sentiment = ratingVal >= 4 ? 'positive' : ratingVal === 3 ? 'neutral' : 'negative';
    const isComplaint = item.issueType && item.issueType !== 'No issue';

    const newFeedback: FeedbackItem = {
      ...item,
      feedbackId: id,
      rating: ratingVal,
      ratings: item.ratings || { overall: ratingVal },
      sentiment,
      feedbackType: isComplaint ? 'complaint' : 'feedback',
      priority: isComplaint ? (ratingVal <= 2 ? 'high' : 'medium') : 'low',
      status: isComplaint ? 'UNDER_REVIEW' : 'RESOLVED',
      processingStatus: isComplaint ? 'Under Review' : 'Submitted',
      responses: item.responses || [],
      internalNotes: item.internalNotes || '',
      aiConfidence: 0.95,
      aiAnalysis: {
        sentiment,
        feedbackType: isComplaint ? 'complaint' : 'feedback',
        categories: [item.category],
        issues: isComplaint && item.issueType ? [item.issueType] : [],
        priority: isComplaint ? 'medium' : 'low',
        confidence: 0.95,
        detectedKeywords: [item.structuredCategory || 'General', item.issueType || 'No issue'],
        possibleRootCause: item.whatCouldBeImproved || 'Normal workflow feedback',
        recommendedAction: isComplaint ? 'Logistics / Support investigation' : 'Acknowledge feedback',
        repeatedIssueFlag: false
      },
      tags: [item.structuredCategory || 'General', item.issueType || 'Feedback'],
      createdAt: now,
      updatedAt: now
    };

    // Update if existing or prepend
    const existingIdx = all.findIndex((f) => f.feedbackId === id || (f.transactionId === item.transactionId && f.userId === item.userId));
    let updated: FeedbackItem[];
    if (existingIdx >= 0) {
      updated = [...all];
      updated[existingIdx] = { ...updated[existingIdx], ...newFeedback, feedbackId: updated[existingIdx].feedbackId };
    } else {
      updated = [newFeedback, ...all];
    }

    this.saveFeedbacks(updated);
    return newFeedback;
  },

  addResponse(feedbackId: string, response: Omit<FeedbackResponse, 'id' | 'createdAt'>): FeedbackItem | null {
    const all = this.loadFeedbacks();
    const idx = all.findIndex((f) => f.feedbackId === feedbackId);
    if (idx < 0) return null;

    const fullResponse: FeedbackResponse = {
      ...response,
      id: `RESP-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today'
    };

    const target = all[idx];
    const updatedResponses = [...(target.responses || []), fullResponse];
    const updatedItem: FeedbackItem = {
      ...target,
      responses: updatedResponses,
      processingStatus: target.processingStatus === 'Submitted' ? 'Responded' : target.processingStatus,
      status: target.status === 'SUBMITTED' ? 'ACTION_TAKEN' : target.status,
      updatedAt: new Date().toISOString()
    };

    all[idx] = updatedItem;
    this.saveFeedbacks(all);
    return updatedItem;
  },

  updateStatusAndNotes(
    feedbackId: string,
    processingStatus: FeedbackProcessingStatus,
    internalNotes?: string,
    adminResponse?: string,
    resolvedBy?: string
  ): FeedbackItem | null {
    const all = this.loadFeedbacks();
    const idx = all.findIndex((f) => f.feedbackId === feedbackId);
    if (idx < 0) return null;

    const target = all[idx];
    const now = new Date().toISOString();

    let newStatus: FeedbackItem['status'] = target.status;
    if (processingStatus === 'Resolved') newStatus = 'RESOLVED';
    else if (processingStatus === 'Under Review') newStatus = 'UNDER_REVIEW';
    else if (processingStatus === 'Responded') newStatus = 'ACTION_TAKEN';
    else if (processingStatus === 'Submitted') newStatus = 'SUBMITTED';

    let responses = target.responses || [];
    if (adminResponse && adminResponse.trim()) {
      responses = [
        ...responses,
        {
          id: `RESP-${Date.now().toString(36).toUpperCase()}`,
          responderId: 'usr-ops-01',
          responderName: resolvedBy || 'Uzhavan Operations Desk',
          responderRole: 'ADMIN',
          message: adminResponse.trim(),
          createdAt: 'Just now'
        }
      ];
    }

    const updatedItem: FeedbackItem = {
      ...target,
      processingStatus,
      status: newStatus,
      internalNotes: internalNotes !== undefined ? internalNotes : target.internalNotes,
      adminResponse: adminResponse || target.adminResponse,
      responses,
      resolvedBy: processingStatus === 'Resolved' ? (resolvedBy || 'Operations Lead') : target.resolvedBy,
      resolvedAt: processingStatus === 'Resolved' ? now : target.resolvedAt,
      updatedAt: now
    };

    all[idx] = updatedItem;
    this.saveFeedbacks(all);
    return updatedItem;
  }
};
