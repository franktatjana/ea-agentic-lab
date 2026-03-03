"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Users } from "lucide-react";

function VariantNodeComponent({ data }: NodeProps) {
  const { name, description } = data as {
    name: string;
    description: string;
  };

  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm min-w-48 max-w-64" title={description}>
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />

      <div className="flex items-center gap-2">
        <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span className="font-medium text-foreground text-xs">{name}</span>
      </div>
    </div>
  );
}

export const VariantNode = memo(VariantNodeComponent);
