import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function MetricCard({ label, value, trend, className, onClick, active }: MetricCardProps) {
  return (
    <Card
      className={cn(
        "",
        onClick && "cursor-pointer hover:border-primary/50 transition-colors",
        active && "border-primary/60",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-xs",
                trend === "improving"
                  ? "text-green-400"
                  : trend === "declining"
                    ? "text-red-400"
                    : "text-muted-foreground"
              )}
            >
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
