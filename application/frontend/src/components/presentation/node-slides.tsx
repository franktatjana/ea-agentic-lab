"use client";

import { ArrowUp, CheckCircle2, Circle, Shield, Target, TrendingDown, TrendingUp, Minus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodePresentationData } from "./node-data";
import type { Slide } from "./presentation-shell";
import { SlideFlowDiagram, buildNode, buildEdge } from "./slide-flow-diagram";

function healthColor(s: number) { return s >= 75 ? "text-green-400" : s >= 60 ? "text-yellow-400" : "text-red-400"; }
function healthBg(s: number) { return s >= 75 ? "bg-green-500/10 border-green-500/30" : s >= 60 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-red-500/10 border-red-500/30"; }
function TrendIcon({ trend }: { trend: string }) {
  if (trend === "declining") return <TrendingDown className="h-4 w-4 text-red-400" />;
  if (trend === "improving") return <TrendingUp className="h-4 w-4 text-green-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}
function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-8"><h2 className="text-3xl font-bold">{title}</h2>{subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}</div>;
}

const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-red-500/15 text-red-400", medium: "bg-yellow-500/15 text-yellow-400", low: "bg-green-500/15 text-green-400" };
const stanceColors: Record<string, string> = { champion: "text-green-400", supporter: "text-blue-400", neutral: "text-yellow-400", blocker: "text-red-400", detractor: "text-red-400" };
const statusBadge: Record<string, string> = { completed: "bg-green-500/15 text-green-400", in_progress: "bg-blue-500/15 text-blue-400", upcoming: "bg-yellow-500/15 text-yellow-400", future: "bg-muted text-muted-foreground", overdue: "bg-red-500/15 text-red-400", mitigating: "bg-yellow-500/15 text-yellow-400", monitoring: "bg-blue-500/15 text-blue-400" };

export function buildNodeSlides(data: NodePresentationData): Slide[] {
  const completionPct = Math.round(data.actions.completed / data.actions.total * 100);
  const checklistPct = Math.round(data.blueprint.checklist_done / data.blueprint.checklist_total * 100);

  return [
    // 1. Cover
    { id: "cover", title: "Cover", content: (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-8 w-8 text-primary" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Deal Review</span>
        </div>
        <h1 className="text-5xl font-bold mb-2">{data.name}</h1>
        <p className="text-xl text-muted-foreground mb-6">{data.realm_name}</p>
        <div className="flex items-center gap-3 mb-8">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{data.archetype.replace(/_/g, " ")}</span>
          <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">{data.domain}</span>
          <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">{data.track}</span>
        </div>
        <div className={cn("inline-flex items-center gap-2 px-6 py-3 rounded-xl text-2xl font-bold mb-8 border", healthBg(data.health.score))}>
          <span className={healthColor(data.health.score)}>{data.health.score}</span>
          <span className="text-sm font-normal uppercase text-muted-foreground">health</span>
          <TrendIcon trend={data.health.trend} />
        </div>
        <div className="grid grid-cols-4 gap-8 text-center">
          <div><p className="text-3xl font-bold">{data.commercial.opportunity_arr}</p><p className="text-xs text-muted-foreground uppercase">ARR</p></div>
          <div><p className="text-3xl font-bold">{data.commercial.probability}%</p><p className="text-xs text-muted-foreground uppercase">Probability</p></div>
          <div><p className="text-3xl font-bold">{data.commercial.stage}</p><p className="text-xs text-muted-foreground uppercase">Stage</p></div>
          <div><p className="text-3xl font-bold">{data.commercial.target_close}</p><p className="text-xs text-muted-foreground uppercase">Target Close</p></div>
        </div>
      </div>
    )},

    // 2. Business Case
    { id: "business-case", title: "Business Case", content: (
      <div>
        <SlideHeader title="Business Case" subtitle={data.purpose} />
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border rounded-xl p-5 text-center"><p className="text-4xl font-bold text-green-400">{data.business_case.projected_savings}</p><p className="text-xs text-muted-foreground uppercase mt-1">Projected Savings</p></div>
          <div className="border rounded-xl p-5 text-center"><p className="text-4xl font-bold">{data.business_case.roi}</p><p className="text-xs text-muted-foreground uppercase mt-1">ROI</p></div>
          <div className="border rounded-xl p-5 text-center"><p className="text-4xl font-bold">{data.business_case.payback_months} mo</p><p className="text-xs text-muted-foreground uppercase mt-1">Payback Period</p></div>
        </div>
        <div className="border rounded-xl p-5">
          <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-3">Strategic Drivers</p>
          <div className="space-y-3">
            {data.business_case.drivers.map((d, i) => (
              <div key={i} className="flex items-start gap-3"><ArrowUp className="h-4 w-4 text-primary shrink-0 mt-0.5" /><p className="text-sm">{d}</p></div>
            ))}
          </div>
        </div>
      </div>
    )},

    // 3. Health & Metrics
    { id: "health", title: "Health & Metrics", content: (
      <div>
        <SlideHeader title="Health Score Breakdown" subtitle={`Overall: ${data.health.score}/100 (${data.health.trend})`} />
        <div className="grid grid-cols-5 gap-4 mb-6">
          {data.health.components.map((c, i) => (
            <div key={i} className={cn("border rounded-xl p-4 text-center", healthBg(c.score))}>
              <p className={cn("text-3xl font-bold", healthColor(c.score))}>{c.score}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.name}</p>
              <p className="text-xs text-muted-foreground/50 mt-1">{Math.round(c.weight * 100)}% weight</p>
            </div>
          ))}
        </div>
        {data.health.alerts.length > 0 && (
          <div className="border rounded-xl p-5">
            <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-3">Active Alerts</p>
            <div className="space-y-2">
              {data.health.alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold", severityColors[a.severity])}>{a.severity}</span>
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )},

    // 4. Stakeholders
    { id: "stakeholders", title: "Stakeholders", content: (
      <div>
        <SlideHeader title="Key Stakeholders" subtitle={`${data.stakeholders.length} mapped stakeholders`} />
        <div className="grid grid-cols-2 gap-4">
          {data.stakeholders.map((s, i) => (
            <div key={i} className="border rounded-xl p-4 flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{s.name}</p>
                  <span className={cn("text-xs font-medium", stanceColors[s.stance])}>{s.stance}</span>
                </div>
                <p className="text-sm text-muted-foreground">{s.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-muted-foreground">Influence: <span className="font-medium text-foreground">{s.influence}</span></span>
                  <span className="text-muted-foreground">Role: <span className="font-medium text-foreground">{s.role}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )},

    // 5. Risks & Actions
    { id: "risks-actions", title: "Risks & Actions", content: (
      <div>
        <SlideHeader title="Risks & Actions" subtitle={`${data.risks.length} risks, ${completionPct}% actions complete`} />
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Risk Register</h3>
            <div className="space-y-3">
              {data.risks.map((r, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold", severityColors[r.severity])}>{r.severity}</span>
                    <p className="font-medium text-sm">{r.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground ml-0">
                    <span>{r.category}</span><span>{r.owner}</span>
                    <span className={cn("px-1.5 py-0.5 rounded font-medium", statusBadge[r.status] || "bg-muted text-muted-foreground")}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Actions ({data.actions.completed}/{data.actions.total})</h3>
            <div className="h-2 rounded-full bg-muted mb-4 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="space-y-3">
              {data.actions.items.map((a, i) => (
                <div key={i} className="flex items-start gap-3 border rounded-lg p-3">
                  {a.status === "overdue" ? <Circle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" /> : <Circle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.owner} / Due: {a.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )},

    // 6. Competitive
    { id: "competitive", title: "Competitive", content: (
      <div>
        <SlideHeader title="Competitive Landscape" />
        <div className="space-y-4">
          {data.competitive.map((c, i) => (
            <div key={i} className="border rounded-xl p-5 flex items-start gap-4">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold">{c.competitor}</p>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold",
                    c.threat_level === "HIGH" || c.threat_level === "CRITICAL" ? "bg-red-500/20 text-red-400" :
                    c.threat_level === "MEDIUM" ? "bg-yellow-500/15 text-yellow-400" : "bg-green-500/15 text-green-400",
                  )}>{c.threat_level}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{c.status}</p>
                <p className="text-sm mt-2">{c.differentiation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )},

    // 7. Blueprint Progress (React Flow timeline)
    { id: "blueprint", title: "Blueprint Progress", content: (() => {
      const statusColor: Record<string, string> = { completed: "green", in_progress: "blue", upcoming: "muted", future: "muted" };
      const msGap = 320;
      const milestoneNodes = data.blueprint.milestones.map((m, i) =>
        buildNode(`ms-${i}`, m.name, i * msGap, 0, {
          subtitle: m.date || undefined,
          badge: m.status.replace(/_/g, " "),
          color: statusColor[m.status] || "muted",
          size: "lg",
          animIndex: i,
        }),
      );
      const milestoneEdges = data.blueprint.milestones.slice(1).map((_, i) =>
        buildEdge(`ms-e-${i}`, `ms-${i}`, `ms-${i + 1}`, undefined,
          data.blueprint.milestones[i].status === "completed" ? "green" : "default",
          { sourceHandle: "right", targetHandle: "left" },
        ),
      );

      return (
        <div>
          <SlideHeader title="Blueprint Progress" subtitle={`Phase: ${data.blueprint.phase}`} />
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border rounded-xl p-5 text-center">
              <p className="text-4xl font-bold">{data.blueprint.playbooks_active}/{data.blueprint.playbooks_total}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Playbooks Active</p>
            </div>
            <div className="border rounded-xl p-5 text-center">
              <p className="text-4xl font-bold">{checklistPct}%</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Checklist ({data.blueprint.checklist_done}/{data.blueprint.checklist_total})</p>
            </div>
            <div className="border rounded-xl p-5 text-center">
              <p className="text-4xl font-bold">{data.blueprint.milestones.filter(m => m.status === "completed").length}/{data.blueprint.milestones.length}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Milestones Done</p>
            </div>
          </div>
          <SlideFlowDiagram nodes={milestoneNodes} edges={milestoneEdges} height={200} />
        </div>
      );
    })()},

    // 8. Next Steps
    { id: "next-steps", title: "Next Steps", content: (
      <div>
        <SlideHeader title="Next Steps" />
        <div className="space-y-4 mb-8">
          {data.next_steps.map((n, i) => (
            <div key={i} className="flex items-start gap-4 border rounded-xl p-5">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-medium">{n.action}</p>
                <p className="text-sm text-muted-foreground mt-1">{n.owner} / Due: {n.due}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <p className="text-sm font-medium">Target Close: {data.commercial.target_close}</p>
            <p className="text-sm text-muted-foreground mt-1">ARR: {data.commercial.opportunity_arr} at {data.commercial.probability}%</p>
          </div>
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <p className="text-sm font-medium">Blueprint: {checklistPct}% complete</p>
            <p className="text-sm text-muted-foreground mt-1">Phase: {data.blueprint.phase}</p>
          </div>
        </div>
      </div>
    )},
  ];
}
