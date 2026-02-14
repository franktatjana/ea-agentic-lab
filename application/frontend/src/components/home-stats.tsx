"use client";

import { useQuery } from "@tanstack/react-query";
import { Bot, BookOpen, Frame, Layers } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

const STATIC_STATS = [
  { icon: Bot, label: "AI Agents", color: "border-amber-600/20 bg-amber-600/10", iconColor: "text-amber-400" },
  { icon: BookOpen, label: "Playbooks", color: "border-green-600/20 bg-green-600/10", iconColor: "text-green-400" },
  { icon: Layers, label: "Blueprints", color: "border-purple-600/20 bg-purple-600/10", iconColor: "text-purple-400" },
  { icon: Frame, label: "Canvas Types", color: "border-cyan-600/20 bg-cyan-600/10", iconColor: "text-cyan-400" },
];

const AGENT_COUNT = 30;

export function HomeStats() {
  const { data: playbooks } = useQuery({
    queryKey: ["playbooks"],
    queryFn: () => api.listPlaybooks(),
  });

  const { data: blueprints } = useQuery({
    queryKey: ["referenceBlueprints"],
    queryFn: () => api.listReferenceBlueprints(),
  });

  const { data: canvases } = useQuery({
    queryKey: ["canvasCatalog"],
    queryFn: api.getCanvasCatalog,
  });

  const values = [
    String(AGENT_COUNT),
    playbooks ? String(playbooks.length) : "–",
    blueprints ? String(blueprints.length) : "–",
    canvases ? String(canvases.length) : "–",
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATIC_STATS.map((s, i) => (
        <Card key={s.label} className={`h-full ${s.color}`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              <span className="font-semibold text-sm">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{values[i]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
