"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BookOpen } from "lucide-react";

const ACCENT = "#8b5cf6";

function PromptNodeComponent({ data }: NodeProps) {
  const { promptKey, stepNumber, description, isLast } = data as {
    promptKey: string;
    stepNumber: number;
    description: string;
    input: string;
    isFirst: boolean;
    isLast: boolean;
  };

  return (
    <div
      className="bg-card rounded-lg px-3 py-2 shadow-sm min-w-48 max-w-72 cursor-pointer border border-border"
      style={{ borderLeft: `3px solid ${ACCENT}` }}
    >
      <Handle type="target" position={Position.Top} style={{ background: ACCENT }} />
      {!isLast && <Handle type="source" position={Position.Bottom} style={{ background: ACCENT }} />}

      <div className="flex items-center gap-1.5 mb-0.5">
        <span
          className="text-[9px] font-mono font-bold shrink-0 rounded-full w-4 h-4 flex items-center justify-center text-white"
          style={{ background: ACCENT }}
        >
          {stepNumber}
        </span>
        <BookOpen className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className="font-medium text-foreground text-[11px]">{promptKey}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
    </div>
  );
}

export const PromptNode = memo(PromptNodeComponent);
