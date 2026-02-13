"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Grid3x3,
  Shield,
  Zap,
  Users,
  Target,
  Map,
  FileText,
  Lightbulb,
  CircleDot,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CanvasCatalogItem } from "@/types";

const CANVAS_ICONS: Record<string, React.ReactNode> = {
  context_canvas: <Target className="h-5 w-5" />,
  decision_canvas: <Lightbulb className="h-5 w-5" />,
  architecture_decision: <Grid3x3 className="h-5 w-5" />,
  risk_governance: <Shield className="h-5 w-5" />,
  value_stakeholders: <Users className="h-5 w-5" />,
  execution_map: <Map className="h-5 w-5" />,
  problem_solution_fit: <Zap className="h-5 w-5" />,
  architecture_communication: <FileText className="h-5 w-5" />,
  change_management: <CircleDot className="h-5 w-5" />,
  challenge_canvas: <AlertCircle className="h-5 w-5" />,
};

const CANVAS_COLORS: Record<string, string> = {
  context_canvas: "text-blue-400 bg-blue-400/10 border-blue-500/20",
  decision_canvas: "text-amber-400 bg-amber-400/10 border-amber-500/20",
  architecture_decision: "text-purple-400 bg-purple-400/10 border-purple-500/20",
  risk_governance: "text-red-400 bg-red-400/10 border-red-500/20",
  value_stakeholders: "text-green-400 bg-green-400/10 border-green-500/20",
  execution_map: "text-teal-400 bg-teal-400/10 border-teal-500/20",
  problem_solution_fit: "text-orange-400 bg-orange-400/10 border-orange-500/20",
  architecture_communication: "text-indigo-400 bg-indigo-400/10 border-indigo-500/20",
  change_management: "text-cyan-400 bg-cyan-400/10 border-cyan-500/20",
  challenge_canvas: "text-rose-400 bg-rose-400/10 border-rose-500/20",
};

function priorityVariant(priority: string): "default" | "secondary" | "outline" | "destructive" {
  if (priority === "critical") return "destructive";
  if (priority === "high") return "default";
  return "secondary";
}

function statusColor(status: string): string {
  if (status === "active") return "text-green-400";
  if (status === "planned") return "text-yellow-400";
  return "text-muted-foreground";
}

type FilterMode = "all" | "core" | "specialized" | "planned";

function SummaryCards({ items }: { items: CanvasCatalogItem[] }) {
  const active = items.filter((c) => c.status === "active");
  const core = items.filter((c) => c.core_canvas);
  const withAssembler = items.filter((c) => c.has_assembler);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Canvas Types</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{items.length}</span>
            <span className="text-xs text-muted-foreground">
              {active.length} active
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Core Canvases</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-blue-400">{core.length}</span>
            <span className="text-xs text-muted-foreground">required for all nodes</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">With Data Pipeline</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-green-400">{withAssembler.length}</span>
            <span className="text-xs text-muted-foreground">
              of {active.length} active
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Section Formats</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">
              {new Set(items.flatMap((c) => c.section_formats)).size}
            </span>
            <span className="text-xs text-muted-foreground">visual types</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CanvasCard({ canvas }: { canvas: CanvasCatalogItem }) {
  const colorClasses = CANVAS_COLORS[canvas.canvas_id] || "text-muted-foreground bg-muted/10 border-border";
  const [iconColor] = colorClasses.split(" ");

  return (
    <Card className={cn("transition-colors", colorClasses)}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-3">
          <div className={cn("shrink-0 mt-0.5", iconColor)}>
            {CANVAS_ICONS[canvas.canvas_id] || <LayoutGrid className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-semibold leading-tight">
              {canvas.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Badge variant={priorityVariant(canvas.priority)} className="text-[10px] capitalize">
                {canvas.priority}
              </Badge>
              {canvas.core_canvas && (
                <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">
                  Core
                </Badge>
              )}
              <span className={cn("text-[10px] flex items-center gap-1", statusColor(canvas.status))}>
                <CircleDot className="h-2.5 w-2.5" />
                {canvas.status}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {canvas.description}
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground/70 w-16 shrink-0">Owner</span>
            <span className="text-muted-foreground">{canvas.owner}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground/70 w-16 shrink-0">Cadence</span>
            <span className="text-muted-foreground">{canvas.cadence}</span>
          </div>
          {canvas.layout && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground/70 w-16 shrink-0">Layout</span>
              <span className="text-muted-foreground">{canvas.layout}</span>
            </div>
          )}
        </div>

        {canvas.sections.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">
              Sections ({canvas.section_count})
            </p>
            <div className="flex flex-wrap gap-1">
              {canvas.sections.map((s) => (
                <Badge key={s} variant="outline" className="text-[10px] font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {canvas.required_by.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">
              Required by
            </p>
            <div className="flex flex-wrap gap-1">
              {canvas.required_by.map((r) => (
                <span key={r} className="text-[10px] text-muted-foreground">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {canvas.output && (
          <div className="flex items-start gap-2 text-xs">
            <span className="text-muted-foreground/70 w-16 shrink-0">Output</span>
            <span className="text-muted-foreground">{canvas.output}</span>
          </div>
        )}

        <Separator />

        <div className="flex items-center gap-3 text-[10px]">
          <span className={cn("flex items-center gap-1", canvas.has_spec ? "text-green-400" : "text-muted-foreground/50")}>
            <CheckCircle2 className="h-3 w-3" />
            Spec
          </span>
          <span className={cn("flex items-center gap-1", canvas.has_assembler ? "text-green-400" : "text-yellow-400")}>
            {canvas.has_assembler ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            Data pipeline
          </span>
          {canvas.section_formats.length > 0 && (
            <span className="text-muted-foreground/50">
              {canvas.section_formats.join(", ")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CanvasLibraryPage() {
  const [filter, setFilter] = useState<FilterMode>("all");

  const { data: catalog, isLoading } = useQuery({
    queryKey: ["canvasCatalog"],
    queryFn: api.getCanvasCatalog,
  });

  const filtered = useMemo(() => {
    if (!catalog) return [];
    if (filter === "core") return catalog.filter((c) => c.core_canvas);
    if (filter === "specialized") return catalog.filter((c) => !c.core_canvas && c.status === "active");
    if (filter === "planned") return catalog.filter((c) => c.status === "planned");
    return catalog;
  }, [catalog, filter]);

  if (isLoading || !catalog) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading canvas library...</p>
      </div>
    );
  }

  const coreCanvases = filtered.filter((c) => c.core_canvas);
  const specialized = filtered.filter((c) => !c.core_canvas && c.status === "active");
  const planned = filtered.filter((c) => c.status === "planned");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Canvas Library</h1>
        <p className="text-muted-foreground mt-1">
          Strategic visual artifacts that transform vault data into single-page decision views.
          Each canvas type has a defined spec, data sources, and rendering pipeline.
        </p>
      </div>

      <SummaryCards items={catalog} />

      <div className="flex items-center gap-2">
        {(["all", "core", "specialized", "planned"] as FilterMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === mode
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {mode === "all" ? "All" : mode.charAt(0).toUpperCase() + mode.slice(1)}
            <span className="ml-1.5 text-[10px] opacity-70">
              {mode === "all" && catalog.length}
              {mode === "core" && catalog.filter((c) => c.core_canvas).length}
              {mode === "specialized" && catalog.filter((c) => !c.core_canvas && c.status === "active").length}
              {mode === "planned" && catalog.filter((c) => c.status === "planned").length}
            </span>
          </button>
        ))}
      </div>

      <Separator />

      {coreCanvases.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-blue-400" />
            <h2 className="text-lg font-semibold">Core Canvases</h2>
            <span className="text-xs text-muted-foreground">Required for every node</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreCanvases.map((c) => (
              <CanvasCard key={c.canvas_id} canvas={c} />
            ))}
          </div>
        </div>
      )}

      {specialized.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Grid3x3 className="h-4 w-4 text-purple-400" />
            <h2 className="text-lg font-semibold">Specialized Canvases</h2>
            <span className="text-xs text-muted-foreground">Contextual, triggered by engagement type</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialized.map((c) => (
              <CanvasCard key={c.canvas_id} canvas={c} />
            ))}
          </div>
        </div>
      )}

      {planned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-yellow-400" />
            <h2 className="text-lg font-semibold">Planned</h2>
            <span className="text-xs text-muted-foreground">Registered in roadmap, specs not yet authored</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planned.map((c) => (
              <CanvasCard key={c.canvas_id} canvas={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
