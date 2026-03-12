import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  description?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function MetricCard({ label, value, trend, description, className, onClick, active }: MetricCardProps) {
  return (
    <Card
      className={cn(
        "",
        onClick && "cursor-pointer hover:border-primary/50 transition-colors group",
        active && "border-primary/60",
        className,
      )}
      onClick={onClick}
      title={description}
    >
      <CardContent className="px-3 py-2">
        <div className="flex items-center justify-between">
          <p className={cn("text-xs text-muted-foreground", onClick && "group-hover:text-primary/80")}>{label}</p>
          {onClick && (
            <ArrowRight className="h-3 w-3 text-blue-500 dark:text-amber-400 group-hover:text-blue-400 dark:group-hover:text-amber-300 transition-colors" />
          )}
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-lg font-bold">{value}</span>
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
