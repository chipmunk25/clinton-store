import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface StockBadgeProps {
  status: StockStatus;
  quantity: number;
  className?: string;
}

const statusConfig:  Record<
  StockStatus,
  { label: string; variant: 'default' | 'warning' | 'destructive' }
> = {
  in_stock: { label:  'In Stock', variant: 'default' },
  low_stock: { label: 'Low Stock', variant: 'warning' },
  out_of_stock: { label: 'Out of Stock', variant: 'destructive' },
};

export function StockBadge({ status, quantity, className }: StockBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn('gap-1', className)}
    >
      <span className="font-mono">{quantity}</span>
      <span className="text-xs opacity-80">{config.label}</span>
    </Badge>
  );
}