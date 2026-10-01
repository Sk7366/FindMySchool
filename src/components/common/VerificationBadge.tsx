import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Building2, FlaskConical, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { DataStatus } from '../../types/school';

export interface VerificationBadgeProps {
  status?: DataStatus;
  lastVerifiedAt?: string;
  verificationSources?: string[];
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  title: string;
  description: string;
  badgeClass: string;
  iconClass: string;
  icon: React.FC<{ className?: string }>;
}

const STATUS_CONFIG: Record<DataStatus, StatusConfig> = {
  verified: {
    label: 'Verified',
    title: 'Verified Information',
    description: 'Information checked against a documented source.',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/70',
    iconClass: 'text-emerald-700',
    icon: CheckCircle2,
  },
  partially_verified: {
    label: 'Partially verified',
    title: 'Partially Verified',
    description: 'Some details checked against documentation; other sections awaiting confirmation.',
    badgeClass: 'bg-sky-50 text-sky-950 border-sky-300 hover:bg-sky-100/70',
    iconClass: 'text-sky-700',
    icon: ShieldCheck,
  },
  self_reported: {
    label: 'Self-reported',
    title: 'Self-Reported Information',
    description: 'Information supplied by the institution and not independently verified.',
    badgeClass: 'bg-violet-50 text-violet-950 border-violet-300 hover:bg-violet-100/70',
    iconClass: 'text-violet-700',
    icon: Building2,
  },
  demo: {
    label: 'Demo data',
    title: 'Demo Prototype Data',
    description: 'Fictional data used for this prototype.',
    badgeClass: 'bg-amber-50/90 text-amber-950 border-amber-300 hover:bg-amber-100/80',
    iconClass: 'text-amber-700',
    icon: FlaskConical,
  },
  needs_confirmation: {
    label: 'Needs confirmation',
    title: 'Needs Confirmation',
    description: 'Information requires direct verification with the institution.',
    badgeClass: 'bg-orange-50 text-orange-950 border-orange-300 hover:bg-orange-100/70',
    iconClass: 'text-orange-700',
    icon: AlertTriangle,
  },
};

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status = 'demo',
  lastVerifiedAt,
  verificationSources,
  size = 'sm',
  showTooltip = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.demo;
  const Icon = config.icon;

  // Close tooltip on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center font-sans ${className}`}
      onMouseEnter={() => showTooltip && setIsOpen(true)}
      onMouseLeave={() => showTooltip && setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (showTooltip) setIsOpen(!isOpen);
        }}
        onFocus={() => showTooltip && setIsOpen(true)}
        onBlur={() => showTooltip && setIsOpen(false)}
        className={`inline-flex items-center font-bold rounded-md border shadow-2xs transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-teal-600/40 ${sizeClasses} ${config.badgeClass}`}
        aria-label={`${config.label} — ${config.description}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Icon className={`${iconSizes} ${config.iconClass} shrink-0`} />
        <span>{config.label}</span>
        {showTooltip && (
          <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" aria-hidden="true" />
        )}
      </button>

      {/* Accessible Interactive Popover / Tooltip */}
      {showTooltip && isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 bg-white rounded-xl border border-stone-200 p-3 shadow-xl text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
        >
          <div className="flex items-start gap-2">
            <div className={`p-1.5 rounded-lg ${config.badgeClass} shrink-0 mt-0.5`}>
              <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-editorial font-bold text-xs text-stone-900 block">
                {config.title}
              </span>
              <p className="text-[11px] text-stone-600 leading-snug mt-1 font-sans">
                {config.description}
              </p>
            </div>
          </div>

          {(lastVerifiedAt || (verificationSources && verificationSources.length > 0)) && (
            <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-500 space-y-1 font-sans">
              {lastVerifiedAt && (
                <div>
                  <span className="font-semibold text-stone-700">Audit / Record:</span>{' '}
                  <span>{lastVerifiedAt}</span>
                </div>
              )}
              {verificationSources && verificationSources.length > 0 && (
                <div>
                  <span className="font-semibold text-stone-700">Source:</span>{' '}
                  <span>{verificationSources.join(' · ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Micro arrow pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-white border-r border-b border-stone-200 rotate-45" />
        </div>
      )}
    </div>
  );
};
