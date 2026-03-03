"use client";

import {
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  Circle,
  Shield,
  TrendingDown,
  TrendingUp,
  Minus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RealmPresentationData } from "./realm-data";
import type { Slide } from "./presentation-shell";
import { SlideFlowDiagram, buildNode, buildEdge } from "./slide-flow-diagram";

function healthColor(score: number): string {
  if (score >= 75) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function healthBg(score: number): string {
  if (score >= 75) return "bg-green-500/10 border-green-500/30";
  if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "declining") return <TrendingDown className="h-4 w-4 text-red-400" />;
  if (trend === "improving") return <TrendingUp className="h-4 w-4 text-green-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

const confidenceColors: Record<string, string> = {
  high: "bg-green-500/15 text-green-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  low: "bg-red-500/15 text-red-400",
};

const fitColors: Record<string, string> = {
  HIGH: "bg-green-500/15 text-green-400",
  MEDIUM: "bg-yellow-500/15 text-yellow-400",
  LOW: "bg-red-500/15 text-red-400",
};

const threatColors: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-400",
  HIGH: "bg-red-500/15 text-red-400",
  MEDIUM: "bg-yellow-500/15 text-yellow-400",
  LOW: "bg-green-500/15 text-green-400",
};

const statusBadge: Record<string, string> = {
  active: "bg-green-500/15 text-green-400",
  planning: "bg-blue-500/15 text-blue-400",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400",
  COMPLETED: "bg-green-500/15 text-green-400",
  NOT_STARTED: "bg-muted text-muted-foreground",
  BLOCKED: "bg-red-500/15 text-red-400",
  PLANNING: "bg-blue-500/15 text-blue-400",
};

const relationshipColors: Record<string, string> = {
  STRONG: "text-green-400",
  MODERATE: "text-yellow-400",
  DEVELOPING: "text-blue-400",
  NEW: "text-blue-400",
  COOLING: "text-red-400",
  NEUTRAL: "text-muted-foreground",
};

export function buildRealmSlides(data: RealmPresentationData): Slide[] {
  return [
    // 1. Cover
    {
      id: "cover",
      title: "Cover",
      content: (
        <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
              Realm Overview
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-3">{data.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {data.tier}
            </span>
            <span className="text-lg text-muted-foreground">
              {data.industry}
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-lg text-muted-foreground">{data.region}</span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-2xl font-bold mb-8 border",
              healthBg(data.health.score),
            )}
          >
            <span className={healthColor(data.health.score)}>
              {data.health.score}
            </span>
            <span className="text-sm font-normal uppercase text-muted-foreground">
              health score
            </span>
            <TrendIcon trend={data.health.trend} />
          </div>
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">{data.metrics.total_nodes}</p>
              <p className="text-xs text-muted-foreground uppercase">Nodes</p>
            </div>
            <div>
              <p className={cn("text-3xl font-bold", healthColor(data.metrics.avg_health))}>
                {data.metrics.avg_health}
              </p>
              <p className="text-xs text-muted-foreground uppercase">Avg Health</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{data.financials.total_arr}</p>
              <p className="text-xs text-muted-foreground uppercase">Total ARR</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">{data.financials.yoy_growth}</p>
              <p className="text-xs text-muted-foreground uppercase">YoY Growth</p>
            </div>
          </div>
        </div>
      ),
    },

    // 2. Account Overview
    {
      id: "account",
      title: "Account Overview",
      content: (
        <div>
          <SlideHeader title="Account Overview" subtitle={data.company.legal_name} />
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="border rounded-xl p-5">
                <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-3">
                  Company Profile
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Founded</p>
                    <p className="font-medium">{data.company.founded}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Headquarters</p>
                    <p className="font-medium">{data.company.headquarters}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Employees</p>
                    <p className="font-medium">{data.company.employees.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium">{data.company.revenue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">{data.company.public_private}</p>
                  </div>
                  {data.company.stock_symbol && (
                    <div>
                      <p className="text-muted-foreground">Ticker</p>
                      <p className="font-medium">{data.company.stock_symbol}</p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{data.company.description}</p>
            </div>
            <div>
              <div className="border rounded-xl p-5 mb-4">
                <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-3">
                  Our Engagement
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total ARR</p>
                    <p className="text-2xl font-bold">{data.financials.total_arr}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">YoY Growth</p>
                    <p className="text-2xl font-bold text-green-400">{data.financials.yoy_growth}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Penetration</p>
                    <p className="font-medium">{data.financials.penetration}% of {data.financials.tam} TAM</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Renewal</p>
                    <p className="font-medium">{data.financials.days_to_renewal > 0 ? `${data.financials.days_to_renewal} days` : "N/A"}</p>
                  </div>
                </div>
              </div>
              {data.financials.products.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                    Deployed Products
                  </p>
                  {data.financials.products.map((p, i) => (
                    <div key={i} className="flex items-center justify-between border rounded-lg p-3 text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="font-bold">{p.arr}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },

    // 3. Nodes & Health
    {
      id: "nodes",
      title: "Nodes & Health",
      content: (
        <div>
          <SlideHeader title="Active Nodes" subtitle={`${data.nodes.length} active engagements`} />
          <div className="grid grid-cols-2 gap-6 mb-8">
            {data.nodes.map((n, i) => (
              <div key={i} className={cn("border rounded-xl p-6", healthBg(n.health))}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xl font-bold">{n.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted">{n.status}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted">{n.mode}</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{n.arr}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", n.health >= 75 ? "bg-green-500" : n.health >= 60 ? "bg-yellow-500" : "bg-red-500")}
                      style={{ width: `${n.health}%` }}
                    />
                  </div>
                  <span className={cn("text-lg font-bold", healthColor(n.health))}>
                    {n.health}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="border rounded-xl p-5">
            <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-3">
              Health & Risk Summary
            </p>
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <p className={cn("text-4xl font-bold", healthColor(data.health.score))}>
                  {data.health.score}
                </p>
                <p className="text-xs text-muted-foreground uppercase mt-1">Health Score</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{data.health.nps || "—"}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">NPS</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{data.metrics.critical_risks}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">Critical Risks</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{data.metrics.overdue_actions}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">Overdue Actions</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 4. Strategy
    {
      id: "strategy",
      title: "Strategic Initiatives",
      content: (
        <div>
          <SlideHeader title="Strategic Initiatives" subtitle="Customer initiatives and vendor relevance" />
          <div className="space-y-4">
            {data.strategic_initiatives.map((s, i) => (
              <div key={i} className="border rounded-xl p-5 flex items-start gap-4">
                <div className="shrink-0">
                  <span className={cn(
                    "inline-block px-2.5 py-1 rounded text-xs font-medium",
                    statusBadge[s.status] || "bg-muted text-muted-foreground",
                  )}>
                    {s.status}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold">{s.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.relevance}</p>
                </div>
                <p className="text-sm text-muted-foreground shrink-0">{s.timeframe}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 5. Opportunities
    {
      id: "opportunities",
      title: "Opportunities",
      content: (
        <div>
          <SlideHeader
            title="Opportunities"
            subtitle={`${data.opportunities.items.length} identified, ${data.opportunities.total_potential} total potential`}
          />
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Opportunity</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dept</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Potential</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {data.opportunities.items.map((o, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{o.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.department}</td>
                    <td className="px-4 py-3 text-right font-semibold">{o.potential}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", confidenceColors[o.confidence])}>
                        {o.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    // 6. Competitive Landscape
    {
      id: "competitive",
      title: "Competitive Landscape",
      content: (
        <div>
          <SlideHeader title="Competitive Landscape" subtitle="Competitor positioning and differentiation" />
          <div className="space-y-4">
            {data.competitors.map((c, i) => (
              <div key={i} className="border rounded-xl p-5 flex items-start gap-4">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold">{c.name}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold",
                      threatColors[c.threat_level] || "bg-muted text-muted-foreground",
                    )}>
                      {c.threat_level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.status}</p>
                  <p className="text-sm mt-2">{c.our_differentiation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 7. Growth & Whitespace
    {
      id: "growth",
      title: "Growth & Whitespace",
      content: (
        <div>
          <SlideHeader
            title="Growth & Whitespace"
            subtitle={`${data.growth.current_penetration} penetration, ${data.growth.total_whitespace} whitespace`}
          />
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border rounded-xl p-5 text-center">
              <p className="text-4xl font-bold">{data.growth.current_penetration}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Current Penetration</p>
            </div>
            <div className="border rounded-xl p-5 text-center">
              <p className="text-4xl font-bold text-green-400">{data.growth.total_whitespace}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Total Whitespace</p>
            </div>
            <div className="border rounded-xl p-5 text-center">
              <p className="text-4xl font-bold">{data.financials.tam}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">TAM</p>
            </div>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Growth Area</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Potential</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Fit</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Timeline</th>
                </tr>
              </thead>
              <tbody>
                {data.growth.items.map((g, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{g.area}</td>
                    <td className="px-4 py-3 text-right font-semibold">{g.potential}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", fitColors[g.fit])}>
                        {g.fit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{g.timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    // 8. Stakeholders (React Flow network map)
    { id: "stakeholders", title: "Key Stakeholders", content: (() => {
      const relColor: Record<string, string> = { STRONG: "green", MODERATE: "yellow", DEVELOPING: "blue", NEW: "blue", COOLING: "red", NEUTRAL: "muted" };
      const cx = 400;
      const cy = 350;
      const nodes = [
        buildNode("company", data.name, cx, cy, { subtitle: data.industry, color: "primary", size: "lg", animIndex: 0 }),
      ];
      const edges: ReturnType<typeof buildEdge>[] = [];

      const count = data.stakeholders.length;
      const radius = 380;
      data.stakeholders.forEach((s, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius * 1.2;
        const y = cy + Math.sin(angle) * radius;
        const color = relColor[s.relationship] || "default";
        const sId = `s-${i}`;
        nodes.push(buildNode(sId, s.name, x, y, {
          subtitle: s.title,
          badge: `${s.influence} influence`,
          color,
          size: s.influence === "HIGH" ? "md" : "sm",
          animIndex: i + 1,
          detail: (
            <div>
              <h3 className="text-lg font-semibold mb-1">{s.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{s.title}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Role</p>
                  <p className="text-sm font-medium">{s.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Influence</p>
                  <p className="text-sm font-medium">{s.influence}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Relationship</p>
                <span className={cn("px-2 py-1 rounded text-xs font-medium bg-muted", relationshipColors[s.relationship])}>
                  {s.relationship}
                </span>
              </div>
            </div>
          ),
        }));
        edges.push(buildEdge(`company-${sId}`, "company", sId, s.role, color));
      });

      return (
        <div>
          <SlideHeader title="Stakeholder Map" subtitle="Relationship strength and influence" />
          <SlideFlowDiagram nodes={nodes} edges={edges} height={420} />
        </div>
      );
    })()},

    // 9. Vendor Landscape
    {
      id: "vendors",
      title: "Vendor Landscape",
      content: (
        <div>
          <SlideHeader title="Technology & Vendor Landscape" subtitle="Current technology stack and our positioning" />
          <div className="border rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dominant Vendor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Our Position</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.vendor_landscape.map((v, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{v.category}</td>
                    <td className="px-4 py-3">{v.dominant}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "font-medium",
                        v.our_position === "Strong" ? "text-green-400" :
                        v.our_position === "Emerging" ? "text-blue-400" :
                        v.our_position === "Lost" ? "text-red-400" :
                        "text-muted-foreground",
                      )}>
                        {v.our_position}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{v.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border rounded-xl p-5">
            <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-3">
              Risks
            </p>
            <div className="space-y-2">
              {data.health.risks.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-bold shrink-0",
                    r.impact === "HIGH" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400",
                  )}>
                    {r.impact}
                  </span>
                  <span>{r.risk}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Likelihood: {r.likelihood}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },

    // 10. Activities & Next Steps
    {
      id: "activities",
      title: "Activities & Next Steps",
      content: (
        <div>
          <SlideHeader title="Activities & Next Steps" />
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Priorities</h3>
              <div className="space-y-3">
                {data.activities.priorities.map((p, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {p.status === "COMPLETED"
                        ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                        : p.status === "BLOCKED"
                          ? <Circle className="h-4 w-4 text-red-400 shrink-0" />
                          : <Circle className="h-4 w-4 text-blue-400 shrink-0" />
                      }
                      <p className="font-medium text-sm">{p.priority}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                      <span>{p.owner}</span>
                      <span>Due: {p.due}</span>
                      <span className={cn("px-1.5 py-0.5 rounded font-medium", statusBadge[p.status] || "bg-muted text-muted-foreground")}>
                        {p.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Next 30 Days</h3>
              <div className="space-y-3">
                {data.activities.next_30_days.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 border rounded-lg p-3">
                    <ArrowUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{a.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.owner}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl border border-primary/30 bg-primary/5">
                <p className="text-sm font-medium">
                  NPS: {data.health.nps || "N/A"} ({data.health.sentiment})
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Health trend: {data.health.trend}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];
}
