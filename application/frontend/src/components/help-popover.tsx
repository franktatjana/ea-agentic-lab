import { HelpCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function HelpPopover({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <p className="text-sm font-medium mb-1">{title}</p>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}
