import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface HealthBarProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

function getHealthColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function getProgressColor(score: number): string {
  if (score >= 80) return "[&>div]:bg-green-500";
  if (score >= 60) return "[&>div]:bg-yellow-500";
  return "[&>div]:bg-red-500";
}

export function HealthBar({ score, showLabel = true, className }: HealthBarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Progress
        value={score}
        className={cn("h-2 flex-1", getProgressColor(score))}
      />
      {showLabel && (
        <span className={cn("text-sm font-medium tabular-nums", getHealthColor(score))}>
          {score}/100
        </span>
      )}
    </div>
  );
}
