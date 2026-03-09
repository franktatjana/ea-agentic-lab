"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database, Server, MessageSquare, Mail, FileText } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  InfoHub: <Database className="w-3 h-3 text-blue-400 shrink-0" />,
  CRM: <Server className="w-3 h-3 text-green-400 shrink-0" />,
  Slack: <MessageSquare className="w-3 h-3 text-purple-400 shrink-0" />,
  Email: <Mail className="w-3 h-3 text-red-400 shrink-0" />,
  "Document Store": <FileText className="w-3 h-3 text-cyan-400 shrink-0" />,
};

function DestinationNodeComponent({ data }: NodeProps) {
  const { name, description, systems } = data as {
    name: string;
    description: string;
    systems: string[];
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm min-w-44 max-w-64 cursor-pointer hover:border-amber-400/50 transition-colors">
          <Handle type="target" position={Position.Bottom} className="!bg-muted-foreground" />

          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium text-foreground text-xs">{name}</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-72">
        <p className="text-xs font-semibold mb-1">{name}</p>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{description}</p>
        )}
        {systems?.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Possible systems</p>
            <div className="space-y-1">
              {systems.map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-foreground/80">
                  {SYSTEM_ICONS[s] ?? <Server className="w-3 h-3 text-muted-foreground shrink-0" />}
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const DestinationNode = memo(DestinationNodeComponent);
