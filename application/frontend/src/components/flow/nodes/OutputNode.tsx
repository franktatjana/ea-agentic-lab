"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FileOutput, Database } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

function OutputNodeComponent({ data }: NodeProps) {
  const { name, description, destinations } = data as {
    name: string;
    description: string;
    destinations: string[];
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm min-w-44 max-w-64 cursor-pointer hover:border-blue-400/50 transition-colors">
          <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
          <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />

          <div className="flex items-center gap-2">
            <FileOutput className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-medium text-foreground text-xs">{name}</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-72">
        <p className="text-xs font-semibold mb-1">{name}</p>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{description}</p>
        )}
        {destinations.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Lands in</p>
            <div className="space-y-1">
              {destinations.map((d) => (
                <div key={d} className="flex items-center gap-1.5 text-xs text-foreground/80">
                  <Database className="w-3 h-3 text-amber-400 shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const OutputNode = memo(OutputNodeComponent);
