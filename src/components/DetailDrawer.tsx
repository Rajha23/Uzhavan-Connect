import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Drawer width preset: 'sm' ~380px, 'md' ~440px, 'lg' ~520px */
  width?: 'sm' | 'md' | 'lg';
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  width = 'md'
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Width classes
  const widthClass =
    width === 'sm'
      ? 'w-[380px]'
      : width === 'lg'
      ? 'w-[520px]'
      : 'w-[440px]';

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      // Focus the drawer after animation
      const timer = setTimeout(() => {
        drawerRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      // Restore focus
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC key handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      // Basic focus trap: Tab within the drawer
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  // Backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="detail-drawer-backdrop"
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`detail-drawer-panel ${widthClass}`}
      >
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-5 border-b border-[#ccd5ae]/40 bg-[#faf9f5]/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {Icon && (
                <div className="w-9 h-9 rounded-xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center border border-[#a3b18a]/40 shrink-0 mt-0.5">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              )}
              <div className="min-w-0">
                <h2
                  id="drawer-title"
                  className="text-base font-semibold text-[#01472e] tracking-tight leading-snug"
                >
                  {title}
                </h2>
                {description && (
                  <p className="text-xs text-[#5c7065] mt-0.5 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#5c7065] hover:text-[#01472e] hover:bg-[#eaf4ec] transition-colors shrink-0 cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ── BODY (scrollable) ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 detail-drawer-body">
          {children}
        </div>

        {/* ── FOOTER (optional) ───────────────────────────────────── */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-[#ccd5ae]/40 bg-[#faf9f5]/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
