import React from 'react';
import { FeedbackPriority, ComplaintStatus } from '../../types/feedback';

// ─── Priority Badge ───────────────────────────────────────────────────────────

interface PriorityBadgeProps {
  priority: FeedbackPriority;
  showIcon?: boolean;
}

const PRIORITY_CONFIG: Record<FeedbackPriority, { label: string; classes: string; dot: string }> = {
  high:   { label: 'HIGH',   classes: 'bg-rose-100 text-rose-700 border-rose-300',     dot: 'bg-rose-500' },
  medium: { label: 'MEDIUM', classes: 'bg-amber-100 text-amber-700 border-amber-300',  dot: 'bg-amber-500' },
  low:    { label: 'LOW',    classes: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide ${c.classes}`}>
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
      {c.label}
    </span>
  );
};

// ─── Complaint Status Badge ───────────────────────────────────────────────────

interface FeedbackStatusBadgeProps {
  status: ComplaintStatus;
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; classes: string; icon: string }> = {
  SUBMITTED:      { label: 'Submitted',      classes: 'bg-slate-100 text-slate-600 border-slate-300',     icon: '📨' },
  UNDER_REVIEW:   { label: 'Under Review',   classes: 'bg-blue-100 text-blue-700 border-blue-300',        icon: '🔍' },
  ASSIGNED:       { label: 'Assigned',       classes: 'bg-violet-100 text-violet-700 border-violet-300',  icon: '👤' },
  ACTION_TAKEN:   { label: 'Action Taken',   classes: 'bg-amber-100 text-amber-700 border-amber-300',     icon: '⚙️' },
  RESPONDED:      { label: 'Responded',      classes: 'bg-purple-100 text-purple-700 border-purple-300',  icon: '💬' },
  RESOLVED:       { label: 'Resolved',       classes: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: '✅' },
  USER_CONFIRMED: { label: 'User Confirmed', classes: 'bg-teal-100 text-teal-700 border-teal-300',        icon: '🎉' },
  CLOSED:         { label: 'Closed',         classes: 'bg-gray-100 text-gray-500 border-gray-300',        icon: '🔒' },
};

export const FeedbackStatusBadge: React.FC<FeedbackStatusBadgeProps> = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.SUBMITTED;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${c.classes}`}>
      <span className="text-[11px]">{c.icon}</span>
      {c.label}
    </span>
  );
};

// ─── Status Lifecycle Stepper ─────────────────────────────────────────────────

const STATUS_ORDER: ComplaintStatus[] = [
  'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'ACTION_TAKEN', 'RESOLVED', 'USER_CONFIRMED',
];

interface StatusStepperProps {
  currentStatus: ComplaintStatus;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus }) => {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto">
      {STATUS_ORDER.map((status, idx) => {
        const cfg = STATUS_CONFIG[status];
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center min-w-[60px]">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                done ? 'bg-[#01472e] border-[#01472e] text-white' : 'bg-white border-[#ccd5ae] text-[#788c80]'
              } ${active ? 'ring-2 ring-[#01472e]/30 scale-110' : ''}`}>
                {done ? (active ? cfg.icon : '✓') : <span className="text-[10px]">{idx + 1}</span>}
              </div>
              <span className={`text-[9px] mt-1 text-center leading-tight ${done ? 'text-[#01472e] font-medium' : 'text-[#788c80]'}`}>
                {cfg.label}
              </span>
            </div>
            {idx < STATUS_ORDER.length - 1 && (
              <div className={`flex-1 h-0.5 mt-[-12px] mx-0.5 ${idx < currentIdx ? 'bg-[#01472e]' : 'bg-[#ccd5ae]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
