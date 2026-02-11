"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  Layers,
  Clock,
  Gauge,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ARCHETYPE_COLORS: Record<string, string> = {
  competitive_displacement: "bg-red-600/20 text-red-400 border-red-600/30",
  greenfield_adoption: "bg-green-600/20 text-green-400 border-green-600/30",
  platform_consolidation: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  compliance_driven: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  technical_evaluation: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  retention_renewal: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  expansion: "bg-teal-600/20 text-teal-400 border-teal-600/30",
  strategic_account: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
};

function countPlaybooks(bp: Record<string, unknown>): number {
  const playbooks = bp.playbooks as Record<string, unknown> | undefined;
  if (!playbooks) return 0;
  const ids = new Set<string>();
  for (const [, trackVal] of Object.entries(playbooks)) {
    if (!trackVal || typeof trackVal !== "object") continue;
    const track = trackVal as Record<string, unknown>;
    const req = track.required as Record<string, unknown>[];
    const opt = track.optional as Record<string, unknown>[];
    if (Array.isArray(req)) req.forEach((p) => ids.add(String(p.playbook_id || "")));
    if (Array.isArray(opt)) opt.forEach((p) => ids.add(String(p.playbook_id || "")));
  }
  ids.delete("");
  return ids.size;
}

function getTrackNames(bp: Record<string, unknown>): string[] {
  const playbooks = bp.playbooks as Record<string, unknown> | undefined;
  if (!playbooks) return [];
  return Object.keys(playbooks).filter((k) => k !== "all_tracks");
}

function BlueprintCard({ bp }: { bp: Record<string, unknown> }) {
  const meta = bp.metadata as Record<string, unknown> | undefined;
  const name = String(meta?.name || bp.blueprint_id || bp._filename || "Unknown");
  const description = String(meta?.description || "");
  const archetype = String(bp._archetype_dir || bp.archetype || "");
  const blueprintId = String(bp.blueprint_id || (bp._filename as string)?.replace(".yaml", "") || "");
  const timeline = bp.timeline as Record<string, unknown> | undefined;
  const playbookCount = countPlaybooks(bp);
  const tracks = getTrackNames(bp);

  const viewHref = `/blueprints/view?archetype=${encodeURIComponent(archetype)}&id=${encodeURIComponent(blueprintId)}`;

  const discoveryWeeks = timeline?.discovery_weeks ?? timeline?.evaluation_weeks ?? timeline?.recovery_weeks;
  const implWeeks = timeline?.implementation_weeks;
  const stabWeeks = timeline?.stabilization_weeks;
  const totalWeeks = [discoveryWeeks, implWeeks, stabWeeks]
    .filter((w): w is number => typeof w === "number")
    .reduce((a, b) => a + b, 0);

  return (
    <Link href={viewHref} className="block">
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">{name}</CardTitle>
            <Badge className={`text-xs border ${ARCHETYPE_COLORS[archetype] || "bg-muted text-muted-foreground"}`}>
              {formatLabel(archetype)}
            </Badge>
          </div>
          <CardDescription className="mt-1 flex items-center gap-3 text-xs">
            <span className="font-mono text-muted-foreground">{blueprintId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {playbookCount} playbooks
            </span>
            {totalWeeks > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{totalWeeks} weeks
              </span>
            )}
            {tracks.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                {tracks.map(formatLabel).join(", ")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ReferenceBlueprintsPage() {
  const [search, setSearch] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("all");

  const { data: blueprints, isLoading } = useQuery({
    queryKey: ["referenceBlueprints"],
    queryFn: () => api.listReferenceBlueprints(),
  });

  const { data: archetypesData } = useQuery({
    queryKey: ["archetypes"],
    queryFn: () => api.getArchetypes(),
  });

  const archetypeKeys = useMemo(() => {
    const archetypes = archetypesData?.archetypes as Record<string, unknown> | undefined;
    return archetypes ? Object.keys(archetypes) : [];
  }, [archetypesData]);

  const filtered = useMemo(() => {
    if (!blueprints) return [];
    let result = blueprints;
    if (archetypeFilter !== "all") {
      result = result.filter((bp) => bp._archetype_dir === archetypeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((bp) => {
        const meta = bp.metadata as Record<string, unknown> | undefined;
        return (
          String(meta?.name || "").toLowerCase().includes(q) ||
          String(bp.blueprint_id || "").toLowerCase().includes(q) ||
          String(meta?.description || "").toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [blueprints, archetypeFilter, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading blueprints...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/blueprints">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Reference Blueprints</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Composable templates that define playbook composition, canvases, checklists, and governance per engagement archetype and track.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={archetypeFilter} onValueChange={setArchetypeFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by archetype" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Archetypes</SelectItem>
            {archetypeKeys.map((key) => (
              <SelectItem key={key} value={key}>
                {formatLabel(key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layers className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No blueprints found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((bp, i) => (
          <BlueprintCard key={String(bp.blueprint_id || i)} bp={bp} />
        ))}
      </div>
    </div>
  );
}
