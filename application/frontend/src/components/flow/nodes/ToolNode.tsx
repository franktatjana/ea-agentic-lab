"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Wrench } from "lucide-react";

function ToolNodeComponent({ data }: NodeProps) {
  const { name, description } = data as {
    name: string;
    description: string;
  };

  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm min-w-44 max-w-64" title={description}>
      <Handle type="target" position={Position.Right} className="!bg-muted-foreground" />

      <div className="flex items-center gap-2">
        <Wrench className="w-3.5 h-3.5 text-green-400 shrink-0" />
        <span className="font-medium text-foreground text-xs">{name}</span>
      </div>
    </div>
  );
}

export const ToolNode = memo(ToolNodeComponent);
