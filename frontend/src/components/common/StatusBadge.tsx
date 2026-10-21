import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

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
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let IconComponent = ShieldCheck;

  if (isSuccess) {
    colorClasses = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950/50';
    IconComponent = CheckCircle2;
  } else if (isDanger) {
    colorClasses = 'bg-rose-950/70 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-950/50';
    IconComponent = XCircle;
  } else if (isWarning) {
    colorClasses = 'bg-amber-950/70 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-950/50';
    IconComponent = AlertTriangle;
  }

  const displayText = label || norm;

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${sizeClasses} ${colorClasses}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{displayText}</span>
    </span>
  );
};
