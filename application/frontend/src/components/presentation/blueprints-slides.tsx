"use client";

import { Blocks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlueprintsPresentationData } from "./blueprints-data";
import type { Slide } from "./presentation-shell";
import { SlideFlowDiagram, buildNode, buildEdge } from "./slide-flow-diagram";

function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-8"><h2 className="text-3xl font-bold">{title}</h2>{subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}</div>;
}

const archetypeColors: Record<string, string> = {
  red: "border-red-500/40 bg-red-500/5", emerald: "border-emerald-500/40 bg-emerald-500/5",
  violet: "border-violet-500/40 bg-violet-500/5", amber: "border-amber-500/40 bg-amber-500/5",
  cyan: "border-cyan-500/40 bg-cyan-500/5", orange: "border-orange-500/40 bg-orange-500/5",
  blue: "border-blue-500/40 bg-blue-500/5", pink: "border-pink-500/40 bg-pink-500/5",
};

const trackColors: Record<string, string> = {
  slate: "border-slate-500/40 bg-slate-500/10", green: "border-green-500/40 bg-green-500/10",
  purple: "border-purple-500/40 bg-purple-500/10", orange: "border-orange-500/40 bg-orange-500/10",
};

const complexityColors: Record<string, string> = { High: "text-red-400", Medium: "text-yellow-400", Low: "text-green-400" };

function buildClassificationDiagram(data: BlueprintsPresentationData) {
  const archCenter = 0;
  const domCenter = 1100;
  const trackCenter = 2200;
  const rootX = 1100;

  const nodes = [
    buildNode("root", "Engagement", rootX, 0, { subtitle: "Three-Dimensional Classification", color: "primary", size: "lg", animIndex: 0 }),
    buildNode("archetype", "Archetype", archCenter, 180, { subtitle: "What type?", badge: `${data.archetypes.length} patterns`, color: "purple", size: "lg", animIndex: 1 }),
    buildNode("domain", "Domain", domCenter, 180, { subtitle: "What technology?", badge: `${data.domains.length} areas`, color: "blue", size: "lg", animIndex: 2 }),
    buildNode("track", "Track", trackCenter, 180, { subtitle: "What resources?", badge: `${data.tracks.length} tiers`, color: "green", size: "lg", animIndex: 3 }),
  ];

  const edges = [
    buildEdge("root-archetype", "root", "archetype", "playbook selection", "purple"),
    buildEdge("root-domain", "root", "domain", "specialist mapping", "blue"),
    buildEdge("root-track", "root", "track", "resource allocation", "green"),
  ];

  // Archetype children: 2 rows of 4, centered under archCenter
  const archHalf = Math.ceil(data.archetypes.length / 2);
  const archGap = 300;
  data.archetypes.forEach((a, i) => {
    const row = i < archHalf ? 0 : 1;
    const col = row === 0 ? i : i - archHalf;
    const rowCount = row === 0 ? archHalf : data.archetypes.length - archHalf;
    const x = archCenter - ((rowCount - 1) * archGap) / 2 + col * archGap;
    const y = 400 + row * 150;
    nodes.push(buildNode(`arch-${i}`, a.name, x, y, {
      color: "purple", size: "sm", animIndex: 4 + i,
      detail: (
        <div>
          <h3 className="text-lg font-semibold mb-2">{a.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{a.description}</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Complexity</p>
              <p className={cn("text-sm font-medium", complexityColors[a.complexity])}>{a.complexity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Duration</p>
              <p className="text-sm font-medium">{a.typical_duration}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-2">Signals</p>
            <div className="flex flex-wrap gap-1.5">
              {a.signals.map((s, j) => <span key={j} className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 text-xs">{s}</span>)}
            </div>
          </div>
        </div>
      ),
    }));
    edges.push(buildEdge(`archetype-arch-${i}`, "archetype", `arch-${i}`, undefined, "purple"));
  });

  // Domain children: single row centered under domCenter
  const domGap = 300;
  const domStart = domCenter - ((data.domains.length - 1) * domGap) / 2;
  data.domains.forEach((d, i) => {
    nodes.push(buildNode(`dom-${i}`, d.name, domStart + i * domGap, 400, {
      color: "blue", size: "sm", animIndex: 4 + data.archetypes.length + i,
      detail: (
        <div>
          <h3 className="text-lg font-semibold mb-2">{d.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{d.description}</p>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase mb-1">Specialist</p>
            <p className="text-sm font-medium">{d.specialist}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-2">Focus Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {d.focus_areas.map((f, j) => <span key={j} className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 text-xs">{f}</span>)}
            </div>
          </div>
        </div>
      ),
    }));
    edges.push(buildEdge(`domain-dom-${i}`, "domain", `dom-${i}`, undefined, "blue"));
  });

  // Track children: single row centered under trackCenter
  const trackGap = 300;
  const trackStart = trackCenter - ((data.tracks.length - 1) * trackGap) / 2;
  data.tracks.forEach((t, i) => {
    nodes.push(buildNode(`track-${i}`, t.name, trackStart + i * trackGap, 400, {
      color: "green", size: "sm", animIndex: 4 + data.archetypes.length + data.domains.length + i,
      detail: (
        <div>
          <h3 className="text-lg font-semibold mb-2">{t.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Duration</p>
              <p className="text-sm font-medium">{t.duration_weeks} weeks</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">SA Allocation</p>
              <p className="text-sm font-medium">{t.sa_allocation}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Max Playbooks</p>
              <p className="text-sm font-medium">{t.max_playbooks}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Governance</p>
              <p className="text-sm font-medium">{t.governance}</p>
            </div>
          </div>
        </div>
      ),
    }));
    edges.push(buildEdge(`track-track-${i}`, "track", `track-${i}`, undefined, "green"));
  });

  return { nodes, edges };
}

export function buildBlueprintsSlides(data: BlueprintsPresentationData): Slide[] {
  return [
    // 1. Cover
    { id: "cover", title: "Cover", content: (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="flex items-center gap-3 mb-6">
          <Blocks className="h-8 w-8 text-primary" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Framework Overview</span>
        </div>
        <h1 className="text-5xl font-bold mb-3">{data.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">Three-Dimensional Engagement Classification</p>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div><p className="text-4xl font-bold">{data.archetypes.length}</p><p className="text-xs text-muted-foreground uppercase">Archetypes</p></div>
          <div><p className="text-4xl font-bold">{data.domains.length}</p><p className="text-xs text-muted-foreground uppercase">Domains</p></div>
          <div><p className="text-4xl font-bold">{data.tracks.length}</p><p className="text-xs text-muted-foreground uppercase">Tracks</p></div>
        </div>
      </div>
    )},

    // 2. Classification Model (React Flow hierarchy)
    { id: "classification", title: "Classification", content: (() => {
      const { nodes, edges } = buildClassificationDiagram(data);
      return (
        <div>
          <SlideHeader title="Three-Dimensional Classification" subtitle="Every engagement is classified by Archetype, Domain, and Track" />
          <SlideFlowDiagram nodes={nodes} edges={edges} height={420} />
        </div>
      );
    })()},

    // 3. Archetypes (1-4)
    { id: "archetypes-1", title: "Archetypes (1/2)", content: (
      <div>
        <SlideHeader title="Engagement Archetypes" subtitle="First 4 of 8 patterns" />
        <div className="grid grid-cols-2 gap-4">
          {data.archetypes.slice(0, 4).map((a, i) => (
            <div key={i} className={cn("border rounded-xl p-4", archetypeColors[a.color])}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{a.name}</p>
                <span className={cn("text-xs font-medium", complexityColors[a.complexity])}>{a.complexity}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{a.description}</p>
              <p className="text-xs text-muted-foreground">Duration: {a.typical_duration}</p>
              <div className="flex flex-wrap gap-1 mt-2">{a.signals.map((s, j) => <span key={j} className="px-2 py-0.5 rounded bg-muted text-xs">{s}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    )},

    // 4. Archetypes (5-8)
    { id: "archetypes-2", title: "Archetypes (2/2)", content: (
      <div>
        <SlideHeader title="Engagement Archetypes" subtitle="Last 4 of 8 patterns" />
        <div className="grid grid-cols-2 gap-4">
          {data.archetypes.slice(4).map((a, i) => (
            <div key={i} className={cn("border rounded-xl p-4", archetypeColors[a.color])}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{a.name}</p>
                <span className={cn("text-xs font-medium", complexityColors[a.complexity])}>{a.complexity}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{a.description}</p>
              <p className="text-xs text-muted-foreground">Duration: {a.typical_duration}</p>
              <div className="flex flex-wrap gap-1 mt-2">{a.signals.map((s, j) => <span key={j} className="px-2 py-0.5 rounded bg-muted text-xs">{s}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    )},

    // 5. Domains
    { id: "domains", title: "Domains", content: (
      <div>
        <SlideHeader title="Technology Domains" subtitle="Specialist expertise areas" />
        <div className="grid grid-cols-2 gap-4">
          {data.domains.map((d, i) => (
            <div key={i} className="border rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-1">{d.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{d.description}</p>
              <p className="text-xs text-muted-foreground mb-2">Specialist: <span className="font-medium text-foreground">{d.specialist}</span></p>
              <div className="flex flex-wrap gap-1">{d.focus_areas.map((f, j) => <span key={j} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">{f}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    )},

    // 6. Engagement Tracks
    { id: "tracks", title: "Tracks", content: (
      <div>
        <SlideHeader title="Engagement Tracks" subtitle="Resource allocation tiers" />
        <div className="grid grid-cols-2 gap-4">
          {data.tracks.map((t, i) => (
            <div key={i} className={cn("border rounded-xl p-5", trackColors[t.color])}>
              <h3 className="text-lg font-semibold mb-1">{t.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{t.duration_weeks} weeks</p></div>
                <div><p className="text-muted-foreground">SA Allocation</p><p className="font-medium">{t.sa_allocation}</p></div>
                <div><p className="text-muted-foreground">Max Playbooks</p><p className="font-medium">{t.max_playbooks}</p></div>
                <div><p className="text-muted-foreground">Governance</p><p className="font-medium">{t.governance}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )},

    // 7. Selection Rules
    { id: "selection", title: "Track Selection", content: (
      <div>
        <SlideHeader title="Track Selection Rules" subtitle="How engagements are assigned to tracks" />
        <div className="border rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Condition</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Default Track</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Override</th>
            </tr></thead>
            <tbody>
              {data.selection_rules.map((r, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{r.condition}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">{r.default_track}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{r.override || "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-xl p-4 text-center"><p className="text-3xl font-bold">{data.composition_stats.total_blueprints}</p><p className="text-xs text-muted-foreground uppercase mt-1">Blueprints</p></div>
          <div className="border rounded-xl p-4 text-center"><p className="text-3xl font-bold">{data.composition_stats.total_playbooks}</p><p className="text-xs text-muted-foreground uppercase mt-1">Playbooks</p></div>
          <div className="border rounded-xl p-4 text-center"><p className="text-3xl font-bold">{data.composition_stats.total_canvases}</p><p className="text-xs text-muted-foreground uppercase mt-1">Canvases</p></div>
        </div>
      </div>
    )},
  ];
}
