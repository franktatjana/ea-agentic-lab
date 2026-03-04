"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot } from "lucide-react";

function OrchestratorNodeComponent({ data }: NodeProps) {
  const { name, subAgentCount } = data as {
    name: string;
    subAgentCount: number;
  };

  return (
    <div className="bg-card border-2 border-purple-500/30 rounded-xl px-4 py-2.5 shadow-md min-w-48 text-center">
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-purple-400/60" />

      <div className="flex items-center justify-center gap-2">
        <Bot className="w-4 h-4 text-purple-400" />
        <span className="font-semibold text-foreground text-xs">{name}</span>
      </div>
      {subAgentCount > 0 && (
        <span className="text-[10px] text-muted-foreground">
          orchestrates {subAgentCount} agents
        </span>
      )}
    </div>
  );
}

export const OrchestratorNode = memo(OrchestratorNodeComponent);
