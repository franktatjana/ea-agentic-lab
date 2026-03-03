"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Workflow } from "lucide-react";

function FlowNodeComponent({ data }: NodeProps) {
  const { name, stepCount, isExpanded, isDimmed } = data as {
    name: string;
    stepCount: number;
    isExpanded: boolean;
    isDimmed: boolean;
  };

  return (
    <div
      className={`bg-card border rounded-lg px-4 py-3 shadow-sm min-w-48 max-w-64 cursor-pointer transition-all
        ${isExpanded ? "border-primary border-2 shadow-md" : "border-border"}
        ${isDimmed ? "opacity-40" : "opacity-100"}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Bottom} id="prompts" className="!bg-muted-foreground" />

      <div className="flex items-center gap-2 mb-1">
        <Workflow className="w-4 h-4 text-blue-400" />
        <span className="font-medium text-foreground text-xs">{name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {stepCount} {stepCount === 1 ? "step" : "steps"}
        </span>
        {isExpanded && (
          <span className="text-[10px] text-primary font-medium">expanded</span>
        )}
      </div>
    </div>
  );
}

export const FlowNode = memo(FlowNodeComponent);
