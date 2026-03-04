"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";

function SubAgentNodeComponent({ data }: NodeProps) {
  const router = useRouter();
  const { name, agentId, flowCount } = data as {
    name: string;
    agentId?: string;
    flowCount?: number;
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (agentId) router.push(`/agents/definitions?agent=${agentId}`);
  };

  const handleStyle = "!w-0 !h-0 !min-w-0 !min-h-0 !border-0 !bg-transparent";

  return (
    <div
      onClick={handleNavigate}
      className="bg-card border border-blue-500/30 rounded-lg px-3 py-2 shadow-sm min-w-40 max-w-52 cursor-pointer hover:border-blue-400/60 hover:shadow-md transition-all"
      title={agentId ? "Click to open definition" : undefined}
    >
      <Handle type="target" position={Position.Top} id="top" className={handleStyle} />
      <Handle type="source" position={Position.Top} id="top" className={handleStyle} />
      <Handle type="target" position={Position.Bottom} id="bottom" className={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleStyle} />
      <Handle type="target" position={Position.Left} id="left-in" className={handleStyle} />
      <Handle type="source" position={Position.Left} id="left-in" className={handleStyle} />
      <Handle type="target" position={Position.Right} id="right-out" className={handleStyle} />
      <Handle type="source" position={Position.Right} id="right-out" className={handleStyle} />

      <div className="flex items-center gap-2">
        <Bot className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="font-medium text-foreground text-xs truncate">{name}</span>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] text-blue-400/70">Agent</span>
        {flowCount != null && flowCount > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {flowCount} {flowCount === 1 ? "runbook" : "runbooks"}
          </span>
        )}
      </div>
    </div>
  );
}

export const SubAgentNode = memo(SubAgentNodeComponent);
