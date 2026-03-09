"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot } from "lucide-react";

function SubAgentGroupNodeComponent({ data }: NodeProps) {
  const { name, promptCount } = data as {
    name: string;
    promptCount: number;
  };

  return (
    <div className="bg-card border border-purple-500/30 rounded-lg px-3 py-2 shadow-sm min-w-48 max-w-64 hover:border-purple-400/60 transition-colors">
      <Handle type="target" position={Position.Left} className="!bg-purple-400" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-medium text-foreground text-xs">{name}</span>
        </div>
        {promptCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-400/10 text-purple-400 shrink-0">
            {promptCount}
          </span>
        )}
      </div>
    </div>
  );
}

export const SubAgentGroupNode = memo(SubAgentGroupNodeComponent);
