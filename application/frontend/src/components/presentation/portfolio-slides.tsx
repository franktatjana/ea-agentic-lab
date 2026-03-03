"use client";

import { AlertTriangle, ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioPresentationData } from "./portfolio-data";
import type { Slide } from "./presentation-shell";

function healthColor(s: number) { return s >= 75 ? "text-green-400" : s >= 60 ? "text-yellow-400" : "text-red-400"; }
function TrendIcon({ trend }: { trend: string }) {
  if (trend === "declining") return <TrendingDown className="h-4 w-4 text-red-400" />;
  if (trend === "improving") return <TrendingUp className="h-4 w-4 text-green-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}
function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-8"><h2 className="text-3xl font-bold">{title}</h2>{subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}</div>;
}

const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-red-500/15 text-red-400", medium: "bg-yellow-500/15 text-yellow-400", low: "bg-green-500/15 text-green-400" };

export function buildPortfolioSlides(data: PortfolioPresentationData): Slide[] {
  return [
    // 1. Cover
    { id: "cover", title: "Cover", content: (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium mb-6">Executive Briefing</span>
        <h1 className="text-5xl font-bold mb-3">{data.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{data.owner} / {data.date}</p>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div><p className="text-4xl font-bold">{data.metrics.total_realms}</p><p className="text-xs text-muted-foreground uppercase">Accounts</p></div>
          <div><p className="text-4xl font-bold">{data.metrics.active_nodes}/{data.metrics.total_nodes}</p><p className="text-xs text-muted-foreground uppercase">Active Nodes</p></div>
          <div><p className={cn("text-4xl font-bold", healthColor(data.metrics.avg_health))}>{data.metrics.avg_health}</p><p className="text-xs text-muted-foreground uppercase">Avg Health</p></div>
        </div>
      </div>
    )},

    // 2. Portfolio Health
    { id: "portfolio-health", title: "Portfolio Health", content: (
      <div>
        <SlideHeader title="Portfolio Health Snapshot" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border rounded-xl p-5 text-center">
            <p className={cn("text-5xl font-bold", healthColor(data.metrics.avg_health))}>{data.metrics.avg_health}</p>
            <div className="flex items-center justify-center gap-1 mt-1"><TrendIcon trend={data.metrics.health_trend} /><p className="text-xs text-muted-foreground uppercase">{data.metrics.health_trend}</p></div>
          </div>
          <div className="border rounded-xl p-5 text-center">
            <p className={cn("text-5xl font-bold", data.metrics.critical_risks > 0 ? "text-red-400" : "")}>{data.metrics.critical_risks}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Critical Risks</p>
          </div>
          <div className="border rounded-xl p-5 text-center">
            <p className={cn("text-5xl font-bold", data.metrics.overdue_actions > 0 ? "text-yellow-400" : "")}>{data.metrics.overdue_actions}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Overdue Actions</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-xl p-5 text-center">
            <p className="text-4xl font-bold">{data.metrics.pipeline_arr}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Pipeline ARR</p>
          </div>
          <div className="border rounded-xl p-5 text-center">
            <p className="text-4xl font-bold">{data.metrics.weighted_pipeline}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Weighted Pipeline</p>
          </div>
        </div>
      </div>
    )},

    // 3. Attention Items
    { id: "attention", title: "Attention Items", content: (
      <div>
        <SlideHeader title="Attention Items" subtitle={`${data.attention_items.length} items requiring action`} />
        <div className="space-y-3">
          {data.attention_items.map((item, i) => (
            <div key={i} className="flex items-start gap-4 border rounded-xl p-4">
              <span className={cn("px-2.5 py-1 rounded text-xs font-bold shrink-0 mt-0.5", severityColors[item.severity])}>{item.severity}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{item.message}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.realm} / {item.node}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )},

    // 4. Realm Performance
    { id: "realm-performance", title: "Realm Performance", content: (
      <div>
        <SlideHeader title="Realm Performance" subtitle={`${data.realms.length} accounts`} />
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Account</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Tier</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Nodes</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Health</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Trend</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">ARR</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Risks</th>
            </tr></thead>
            <tbody>
              {data.realms.map((r, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded bg-muted text-xs font-medium">{r.tier}</span></td>
                  <td className="px-4 py-3 text-center">{r.nodes}</td>
                  <td className={cn("px-4 py-3 text-center font-bold", healthColor(r.avg_health))}>{r.avg_health}</td>
                  <td className="px-4 py-3 text-center"><div className="flex justify-center"><TrendIcon trend={r.health_trend} /></div></td>
                  <td className="px-4 py-3 text-right font-semibold">{r.total_arr}</td>
                  <td className={cn("px-4 py-3 text-center font-bold", r.critical_risks > 0 ? "text-red-400" : "")}>{r.critical_risks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )},

    // 5. Pipeline
    { id: "pipeline", title: "Pipeline", content: (
      <div>
        <SlideHeader title="Pipeline Summary" subtitle={`${data.metrics.pipeline_arr} total, ${data.metrics.weighted_pipeline} weighted`} />
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Engagement</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Account</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">ARR</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Probability</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Close Date</th>
            </tr></thead>
            <tbody>
              {data.pipeline.map((p, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{p.node}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.realm}</td>
                  <td className="px-4 py-3 text-right font-semibold">{p.arr}</td>
                  <td className="px-4 py-3 text-center">{p.probability}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.stage}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.target_close}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )},

    // 6. Risk Overview
    { id: "risks", title: "Risk Overview", content: (
      <div>
        <SlideHeader title="Risk Overview" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {(["critical", "high", "medium", "low"] as const).map((sev) => (
            <div key={sev} className={cn("border rounded-xl p-5 text-center", severityColors[sev].replace("text-", "border-").split(" ")[0])}>
              <p className={cn("text-4xl font-bold", severityColors[sev].split(" ")[1])}>{data.risk_summary[sev]}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">{sev}</p>
            </div>
          ))}
        </div>
        <div className="border rounded-xl p-5">
          <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-3">Top Risks</p>
          <div className="space-y-3">
            {data.risk_summary.top_risks.map((r, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className={cn("px-2 py-0.5 rounded text-xs font-bold shrink-0", severityColors[r.severity])}>{r.severity}</span>
                <span className="flex-1">{r.risk}</span>
                <span className="text-muted-foreground shrink-0">{r.realm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )},

    // 7. Highlights & Summary
    { id: "summary", title: "Summary", content: (
      <div>
        <SlideHeader title="Highlights & Key Actions" />
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Highlights</h3>
            <div className="space-y-3">
              {data.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  {h.type === "win" ? <ArrowUp className="h-5 w-5 text-green-400 shrink-0 mt-0.5" /> :
                   h.type === "risk" ? <ArrowDown className="h-5 w-5 text-red-400 shrink-0 mt-0.5" /> :
                   <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />}
                  <p className="text-sm">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
            <div className="space-y-3">
              {data.attention_items.filter(a => a.severity === "critical").map((a, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2"><span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold">{a.severity}</span><p className="font-medium text-sm">{a.message}</p></div>
                  <p className="text-xs text-muted-foreground mt-1">{a.realm} / {a.node}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )},
  ];
}
