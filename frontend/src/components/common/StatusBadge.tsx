import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export type BadgeVariant =
  | 'VALID'
  | 'PASSED'
  | 'ACTIVE'
  | 'AUTHORIZED'
  | 'SUCCESS'
  | 'FAILED'
  | 'INVALID'
  | 'REVOKED'
  | 'EXPIRED'
  | 'WARNING'
  | 'PENDING'
  | 'INFO';

interface StatusBadgeProps {
  status: string | BadgeVariant;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
}) => {
  const norm = String(status).toUpperCase();

  const isSuccess =
    norm === 'VALID' || norm === 'PASSED' || norm === 'ACTIVE' || norm === 'AUTHORIZED' || norm === 'SUCCESS';
  const isDanger =
    norm === 'FAILED' ||
    norm === 'INVALID' ||
    norm === 'REVOKED' ||
    norm === 'EXPIRED' ||
    norm === 'INVALID SIGNATURE' ||
    norm === 'UNTRUSTED ISSUER';
  const isWarning =
    norm === 'WARNING' || norm === 'PENDING' || norm === 'REQUIRED CLAIM MISSING' || norm === 'STATUS COULD NOT BE VERIFIED';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size];

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = ShieldCheck;

  if (isSuccess) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm';
    IconComponent = CheckCircle2;
  } else if (isDanger) {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-300 shadow-sm';
    IconComponent = XCircle;
  } else if (isWarning) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm';
    IconComponent = AlertTriangle;
  }

  const displayText = label || norm;

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${sizeClasses} ${colorClasses}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{displayText}</span>
    </span>
  );
};
