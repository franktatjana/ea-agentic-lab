"use client";

import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasPresentationData } from "./canvas-pres-data";
import type { Slide } from "./presentation-shell";
import type { Edge } from "@xyflow/react";
import { SlideFlowDiagram, buildNode, buildEdge } from "./slide-flow-diagram";

function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-8"><h2 className="text-3xl font-bold">{title}</h2>{subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}</div>;
}

const priorityBadge: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400",
  high: "bg-orange-500/15 text-orange-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  low: "bg-muted text-muted-foreground",
};

const statusBadge: Record<string, string> = {
  active: "bg-green-500/15 text-green-400",
  planned: "bg-yellow-500/15 text-yellow-400",
};

const severityBadge: Record<string, string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  low: "bg-muted text-muted-foreground",
};

const categoryColor: Record<string, string> = {
  core: "blue",
  specialized: "teal",
  portfolio: "purple",
};

function CanvasCard({ c }: { c: CanvasPresentationData["canvas_types"][number] }) {
  return (
    <div className="border rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-lg">{c.name}</p>
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusBadge[c.status])}>{c.status}</span>
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", priorityBadge[c.priority])}>{c.priority}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div><p className="text-muted-foreground">Owner</p><p className="font-medium">{c.owner}</p></div>
        <div><p className="text-muted-foreground">Cadence</p><p className="font-medium">{c.cadence}</p></div>
        <div><p className="text-muted-foreground">Sections</p><p className="font-medium">{c.section_count}</p></div>
        <div><p className="text-muted-foreground">Scope</p><p className="font-medium capitalize">{c.scope}</p></div>
      </div>
      <div className="flex flex-wrap gap-1">
        {c.formats.map((f, j) => (
          <span key={j} className="px-2 py-0.5 rounded bg-muted text-xs">{f.replace(/_/g, " ")}</span>
        ))}
      </div>
    </div>
  );
}

function buildCanvasLibraryDiagram(data: CanvasPresentationData) {
  const core = data.canvas_types.filter((c) => c.core_canvas);
  const specialized = data.canvas_types.filter((c) => !c.core_canvas && c.scope === "node");
  const portfolio = data.canvas_types.filter((c) => c.scope === "portfolio");

  const coreX = 0;
  const specX = 1100;
  const portX = 2200;
  const rootX = 1100;

  const nodes = [
    buildNode("root", "Canvas Library", rootX, 0, { subtitle: "Strategic Visual Artifacts", color: "primary", size: "lg", animIndex: 0 }),
    buildNode("cat-core", "Core", coreX, 180, { subtitle: `${core.length} canvases`, badge: "Required for all nodes", color: "blue", size: "lg", animIndex: 1 }),
    buildNode("cat-spec", "Specialized", specX, 180, { subtitle: `${specialized.length} canvases`, badge: "Context-triggered", color: "teal", size: "lg", animIndex: 2 }),
    buildNode("cat-port", "Portfolio", portX, 180, { subtitle: `${portfolio.length} canvases`, badge: "Per-AE scope", color: "purple", size: "lg", animIndex: 3 }),
  ];

  const edges: Edge[] = [
    buildEdge("root-core", "root", "cat-core", undefined, "blue"),
    buildEdge("root-spec", "root", "cat-spec", undefined, "teal"),
    buildEdge("root-port", "root", "cat-port", undefined, "purple"),
  ];

  let animIdx = 4;

  // Core children
  core.forEach((c, i) => {
    const id = `c-${c.canvas_id}`;
    const x = coreX + (i % 2 === 0 ? -150 : 150);
    const y = 400 + Math.floor(i / 2) * 150;
    nodes.push(buildNode(id, c.name, x, y, {
      subtitle: c.owner,
      color: c.color,
      size: "sm",
      animIndex: animIdx++,
      detail: canvasDetail(c),
    }));
    edges.push(buildEdge(`core-${id}`, "cat-core", id, undefined, "blue"));
  });

  // Specialized children (2-column layout)
  specialized.forEach((c, i) => {
    const id = `c-${c.canvas_id}`;
    const x = specX + (i % 2 === 0 ? -150 : 150);
    const y = 400 + Math.floor(i / 2) * 150;
    nodes.push(buildNode(id, c.name, x, y, {
      subtitle: c.owner,
      color: c.color,
      size: "sm",
      animIndex: animIdx++,
      detail: canvasDetail(c),
    }));
    edges.push(buildEdge(`spec-${id}`, "cat-spec", id, undefined, "teal"));
  });

  // Portfolio children
  portfolio.forEach((c, i) => {
    const id = `c-${c.canvas_id}`;
    const x = portX;
    const y = 400 + i * 150;
    nodes.push(buildNode(id, c.name, x, y, {
      subtitle: c.owner,
      color: c.color,
      size: "sm",
      animIndex: animIdx++,
      detail: canvasDetail(c),
    }));
    edges.push(buildEdge(`port-${id}`, "cat-port", id, undefined, "purple"));
  });

  return { nodes, edges };
}

function canvasDetail(c: CanvasPresentationData["canvas_types"][number]) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-1">{c.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
      <div className="flex items-center gap-2 mb-4">
        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusBadge[c.status])}>{c.status}</span>
        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", priorityBadge[c.priority])}>{c.priority}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase">Owner</p>
          <p className="text-sm font-medium">{c.owner}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Cadence</p>
          <p className="text-sm font-medium">{c.cadence}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Sections</p>
          <p className="text-sm font-medium">{c.section_count}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Scope</p>
          <p className="text-sm font-medium capitalize">{c.scope}</p>
        </div>
      </div>
      {c.output && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground uppercase mb-1">Output</p>
          <p className="text-sm">{c.output}</p>
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground uppercase mb-2">Formats</p>
        <div className="flex flex-wrap gap-1.5">
          {c.formats.map((f, j) => (
            <span key={j} className="px-2 py-1 rounded bg-muted text-xs">{f.replace(/_/g, " ")}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildLifecycleDiagram(data: CanvasPresentationData) {
  const gap = 350;
  const nodes = data.lifecycle.map((l, i) =>
    buildNode(`lc-${i}`, l.state, i * gap, 0, {
      subtitle: l.description,
      color: l.color,
      size: "lg",
      animIndex: i,
    }),
  );

  const edges: Edge[] = [];
  for (let i = 0; i < data.lifecycle.length - 1; i++) {
    const label = data.lifecycle[i].next;
    edges.push(buildEdge(`lc-e-${i}`, `lc-${i}`, `lc-${i + 1}`, label, data.lifecycle[i].color));
  }

  // Backward edge: Stale -> Published ("Re-render")
  edges.push(buildEdge("lc-rerender", "lc-3", "lc-2", "Re-render", "green", {
    sourceHandle: "left",
    targetHandle: "left",
    animated: false,
    style: { stroke: "hsl(142, 71%, 45%)", strokeWidth: 2, strokeDasharray: "8 4", opacity: 0.6 },
  }));

  return { nodes, edges };
}

export function buildCanvasSlides(data: CanvasPresentationData): Slide[] {
  const core = data.canvas_types.filter((c) => c.core_canvas);
  const specialized = data.canvas_types.filter((c) => !c.core_canvas && c.scope === "node");
  const portfolio = data.canvas_types.filter((c) => c.scope === "portfolio");
  const uniqueFormats = [...new Set(data.canvas_types.flatMap((c) => c.formats))];

  return [
    // 1. Cover
    { id: "cover", title: "Cover", content: (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="flex items-center gap-3 mb-6">
          <LayoutGrid className="h-8 w-8 text-primary" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Framework Overview</span>
        </div>
        <h1 className="text-5xl font-bold mb-3">{data.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">Strategic Visual Artifacts</p>
        <div className="grid grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold">{data.total_canvases}</p><p className="text-xs text-muted-foreground uppercase">Total Canvases</p></div>
          <div><p className="text-4xl font-bold">{data.core_count}</p><p className="text-xs text-muted-foreground uppercase">Core</p></div>
          <div><p className="text-4xl font-bold">{data.active_count}</p><p className="text-xs text-muted-foreground uppercase">Active</p></div>
          <div><p className="text-4xl font-bold">{uniqueFormats.length}</p><p className="text-xs text-muted-foreground uppercase">Formats</p></div>
        </div>
      </div>
    )},

    // 2. Canvas Library (React Flow)
    { id: "library", title: "Canvas Library", content: (() => {
      const { nodes, edges } = buildCanvasLibraryDiagram(data);
      return (
        <div>
          <SlideHeader title="Canvas Library" subtitle={`${data.total_canvases} canvas types across ${Object.keys(categoryColor).length} categories`} />
          <SlideFlowDiagram nodes={nodes} edges={edges} height={420} />
        </div>
      );
    })()},

    // 3. Core Canvases
    { id: "core", title: "Core Canvases", content: (
      <div>
        <SlideHeader title="Core Canvases" subtitle="Required for every engagement node" />
        <div className="grid grid-cols-2 gap-6">
          {core.map((c, i) => <CanvasCard key={i} c={c} />)}
        </div>
      </div>
    )},

    // 4. Specialized Canvases (1/2)
    { id: "specialized-1", title: "Specialized (1/2)", content: (
      <div>
        <SlideHeader title="Specialized Canvases" subtitle={`First ${Math.min(4, specialized.length)} of ${specialized.length} context-triggered canvases`} />
        <div className="grid grid-cols-2 gap-4">
          {specialized.slice(0, 4).map((c, i) => <CanvasCard key={i} c={c} />)}
        </div>
      </div>
    )},

    // 5. Specialized Canvases (2/2) + Portfolio
    { id: "specialized-2", title: "Specialized (2/2)", content: (
      <div>
        <SlideHeader title="Specialized & Portfolio Canvases" subtitle={`Remaining specialized + portfolio-level canvases`} />
        <div className="grid grid-cols-2 gap-4">
          {[...specialized.slice(4), ...portfolio].map((c, i) => <CanvasCard key={i} c={c} />)}
        </div>
      </div>
    )},

    // 6. Canvas Lifecycle (React Flow)
    { id: "lifecycle", title: "Canvas Lifecycle", content: (() => {
      const { nodes, edges } = buildLifecycleDiagram(data);
      return (
        <div>
          <SlideHeader title="Canvas Lifecycle" subtitle="State transitions and gap detection rules" />
          <SlideFlowDiagram nodes={nodes} edges={edges} height={260} />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {data.gap_rules.map((r, i) => (
              <div key={i} className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">{r.type}</p>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", severityBadge[r.severity])}>{r.severity}</span>
                </div>
                <p className="text-sm text-muted-foreground">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    })()},

    // 7. Stage Mapping
    { id: "stages", title: "Stage Mapping", content: (
      <div>
        <SlideHeader title="Canvas-to-Stage Mapping" subtitle="Which canvases are required at each engagement stage" />
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stage</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Required</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {data.stage_mapping.map((s, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{s.stage}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.required.map((r, j) => (
                        <span key={j} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.recommended.map((r, j) => (
                        <span key={j} className="px-2 py-0.5 rounded bg-muted text-xs">{r}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )},

    // 8. Rendering Pipeline
    { id: "pipeline", title: "Rendering Pipeline", content: (
      <div>
        <SlideHeader title="Rendering Pipeline & Governance" subtitle="How canvases are assembled and validated" />
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-4">Pipeline</p>
            <div className="space-y-3">
              {data.pipeline_steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3 border rounded-lg p-3">
                  <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.step}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-4">Gap Detection</p>
            <div className="grid grid-cols-1 gap-3">
              {data.gap_rules.map((r, i) => (
                <div key={i} className="border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{r.type}</p>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", severityBadge[r.severity])}>{r.severity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              ))}
            </div>
            <div className="border rounded-xl p-4 mt-4 text-center">
              <p className="text-3xl font-bold">{data.total_canvases}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Registered Canvas Types</p>
            </div>
          </div>
        </div>
      </div>
    )},
  ];
}
