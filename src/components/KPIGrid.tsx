import React from 'react';

export interface KPIStatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  badgeColor?: string;
  valueColor?: string;
  subtitleColor?: string;
  trend?: {
    direction?: 'up' | 'down' | 'neutral';
    text?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#01472e]',
  iconBg = 'bg-[#eaf4ec]',
  badgeColor,
  valueColor = 'text-[#01472e]',
  subtitleColor = 'text-[#01472e]/60',
  trend,
  isActive = false,
  onClick,
  className = ''
}) => {
  const isClickable = typeof onClick === 'function';
  const Component = isClickable ? 'button' : 'div';

  // Resolved icon container color classes
  const iconClasses = badgeColor
    ? badgeColor
    : `${iconBg} ${iconColor} border-[#a3b18a]/40`;

  return (
    <Component
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      className={`agri-card rounded-[22px] sm:rounded-[24px] p-3.5 sm:p-4 border border-[#ccd5ae]/50 bg-white/95 shadow-soft hover:shadow-forest/10 hover:border-[#a3b18a]/60 transition-all duration-200 flex flex-col justify-between h-full min-w-0 min-h-[128px] text-left ${
        isActive
          ? 'border-[#01472e] ring-2 ring-[#01472e]/20 shadow-forest -translate-y-0.5'
          : ''
      } ${isClickable ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* ── HEADER ROW: LABEL + TOP-RIGHT ICON (UNIFORM 34px HEIGHT) ──── */}
      <div className="flex items-start justify-between gap-2 h-[34px] w-full">
        <div className="flex-1 min-w-0 flex items-start h-full pt-0.5">
          <span
            className="text-[10px] xl:text-[11px] font-bold text-[#01472e]/70 uppercase tracking-wider leading-tight line-clamp-2 select-none"
            title={typeof label === 'string' ? label : undefined}
          >
            {label}
          </span>
        </div>
        {Icon && (
          <div
            className={`w-7 h-7 xl:w-8 xl:h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-2xs ${iconClasses}`}
          >
            <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
          </div>
        )}
      </div>

      {/* ── METRIC & SUBTITLE (IDENTICAL VERTICAL POSITION) ──────────── */}
      <div className="mt-3 xl:mt-3.5 pt-1.5 border-t border-[#ccd5ae]/20 w-full min-w-0">
        <div
          className={`text-xl sm:text-2xl xl:text-[22px] font-bold font-heading tracking-tight leading-none truncate ${valueColor}`}
          title={typeof value === 'string' ? value : undefined}
        >
          {value}
        </div>

        {subtitle && (
          <div
            className={`text-[10px] xl:text-[11px] mt-1.5 font-medium leading-tight truncate flex items-center gap-1.5 ${subtitleColor}`}
            title={typeof subtitle === 'string' ? subtitle : undefined}
          >
            {trend?.icon && <trend.icon className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">{subtitle}</span>
          </div>
        )}
      </div>
    </Component>
  );
};

export interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const KPIGrid: React.FC<KPIGridProps> = ({
  children,
  columns,
  gap = 'md',
  className = ''
}) => {
  // Determine column count if not specified
  const childCount = React.Children.count(children);
  const resolvedCols = columns || (childCount === 6 ? 6 : childCount === 5 ? 5 : childCount === 4 ? 4 : childCount === 3 ? 3 : 2);

  // Responsive column classes matching the global KPI standard
  let colClasses = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
  if (resolvedCols === 6) {
    colClasses = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
  } else if (resolvedCols === 5) {
    colClasses = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
  } else if (resolvedCols === 4) {
    colClasses = 'grid-cols-2 lg:grid-cols-4';
  } else if (resolvedCols === 3) {
    colClasses = 'grid-cols-1 sm:grid-cols-3';
  } else if (resolvedCols === 2) {
    colClasses = 'grid-cols-1 sm:grid-cols-2';
  }

  // Consistent gap classes
  const gapClasses =
    gap === 'sm'
      ? 'gap-3'
      : gap === 'lg'
      ? 'gap-4 sm:gap-5'
      : 'gap-3 sm:gap-3.5 xl:gap-4';

  return (
    <div
      className={`grid ${colClasses} ${gapClasses} items-stretch w-full ${className}`}
    >
      {children}
    </div>
  );
};
