import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface StockBadgeProps {
  status: StockStatus;
  quantity: number;
  className?: string;
}

export function StockBadge({ status, quantity, className }: StockBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono",
        status === "out_of_stock" &&
          "border-red-500 text-red-500 bg-red-50 dark:bg-red-950",
        status === "low_stock" &&
          "border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950",
        status === "in_stock" &&
          "border-green-500 text-green-500 bg-green-50 darkbg-green-950",
        className
      )}
    >
      {quantity} {status === "out_of_stock" ? "out" : "in stock"}
    </Badge>
  );
}
