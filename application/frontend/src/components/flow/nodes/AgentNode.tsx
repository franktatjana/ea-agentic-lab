"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot, ShieldCheck } from "lucide-react";

function AgentNodeComponent({ data }: NodeProps) {
  const { name, description, modelId, humanInTheLoop } = data as {
    name: string;
    description: string;
    modelId: string | null;
    humanInTheLoop: boolean;
  };

  return (
    <div className="bg-card border-2 border-primary/30 rounded-xl px-5 py-4 shadow-md min-w-64 max-w-80 text-center">
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Left} id="tools" className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Right} id="variants" className="!bg-muted-foreground" />

      <div className="flex items-center justify-center gap-2 mb-2">
        <Bot className="w-5 h-5 text-purple-400" />
        <span className="font-semibold text-foreground text-sm">{name}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{description}</p>
      <div className="flex items-center justify-center gap-2">
        {modelId && (
          <span className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground">
            {modelId}
          </span>
        )}
        {humanInTheLoop && (
          <span className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" /> HITL
          </span>
        )}
      </div>
    </div>
  );
}

export const AgentNode = memo(AgentNodeComponent);
