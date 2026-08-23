import type { ReactNode, HTMLAttributes } from 'react';
import { Badge as ShadcnBadge, type BadgeProps as ShadcnBadgeProps } from '../shadcn/badge';

export type BadgeTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'muted' | 'teal' | 'outline' | 'neutral';

type ShadcnVariant = NonNullable<ShadcnBadgeProps['variant']>;

const toneMap: Record<BadgeTone, ShadcnVariant> = {
  accent: 'accent',
  teal: 'teal',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  default: 'secondary',
  neutral: 'secondary',
  muted: 'muted',
  outline: 'outline',
};

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: BadgeTone;
  variant?: ShadcnVariant | BadgeTone;
  children?: ReactNode;
  className?: string;
}

export function Badge({ tone, variant, children, className, ...props }: BadgeProps) {
  const chosenVariant = variant
    ? (toneMap[variant as BadgeTone] ?? (variant as ShadcnVariant))
    : tone
    ? toneMap[tone]
    : 'secondary';

  return (
    <ShadcnBadge variant={chosenVariant} className={className} {...props}>
      {children}
    </ShadcnBadge>
  );
}

const statusMap: Record<string, { tone: BadgeTone; label: string }> = {
  booked: { tone: 'info', label: 'Booked' },
  checked_in: { tone: 'accent', label: 'Checked in' },
  in_progress: { tone: 'warning', label: 'In progress' },
  completed: { tone: 'success', label: 'Completed' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
  missed: { tone: 'danger', label: 'Missed' },
  planned: { tone: 'warning', label: 'Planned' },
  scheduled: { tone: 'warning', label: 'Scheduled' },
  confirmed: { tone: 'success', label: 'Confirmed' },
  performed: { tone: 'success', label: 'Performed' },
  pending: { tone: 'warning', label: 'Pending' },
};

export function StatusBadge({ status }: { status: string }) {
  const mapped = statusMap[status] ?? { tone: 'default' as BadgeTone, label: status };
  return <Badge tone={mapped.tone}>{mapped.label}</Badge>;
}

export function StockStatus({
  balance,
  threshold = 0,
  available,
  reserved,
}: {
  balance: number;
  threshold?: number;
  available?: number;
  reserved?: number;
}) {
  const avail = available ?? balance;
  const held = reserved ?? 0;
  if (balance <= 0) return <Badge tone="danger">Out of stock</Badge>;
  if (avail <= 0) return <Badge tone="danger">All held · {balance} reserved</Badge>;
  if (avail <= threshold)
    return (
      <Badge tone="warning">
        Low stock · {avail} available{held > 0 ? ` · ${held} held` : ''}
      </Badge>
    );
  return (
    <Badge tone="success">
      Available · {avail}
      {held > 0 ? ` · ${held} held` : ''}
    </Badge>
  );
}
