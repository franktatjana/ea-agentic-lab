"use client";

import { Activity, ArrowDown, ArrowUp, CheckCircle2, ChevronRight, Circle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QbrData, ScoreStatus } from "./qbr-data";
import type { Slide } from "./presentation-shell";

const statusColors: Record<ScoreStatus, string> = {
  green: "border-green-500/60 text-green-400",
  yellow: "border-yellow-500/60 text-yellow-400",
  red: "border-red-500/60 text-red-400",
};

const statusBg: Record<ScoreStatus, string> = {
  green: "bg-green-500/10",
  yellow: "bg-yellow-500/10",
  red: "bg-red-500/10",
};

const badgeStyles: Record<string, string> = {
  completed: "bg-green-500/15 text-green-400",
  in_progress: "bg-blue-500/15 text-blue-400",
  not_started: "bg-muted text-muted-foreground",
  blocked: "bg-red-500/15 text-red-400",
  open: "bg-red-500/15 text-red-400",
  mitigating: "bg-yellow-500/15 text-yellow-400",
  resolved: "bg-green-500/15 text-green-400",
};

function deriveScoreStatus(score: number): ScoreStatus {
  if (score >= 75) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

function healthColor(score: number): string {
  if (score >= 75) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
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

function DimensionCard({ label, value, detail, weight, status, large }: {
  label: string; value: string; detail: string; weight: number; status: ScoreStatus; large?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border-t-3 p-5",
      statusColors[status], statusBg[status],
    )}>
      <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("font-bold mt-1", large ? "text-5xl" : "text-4xl")}>{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{detail}</p>
      <p className="text-xs text-muted-foreground/50 mt-2">Weight: {weight}%</p>
    </div>
  );
}

export function buildQbrSlides(data: QbrData, onRealmClick?: (realmId: string) => void): Slide[] {
  const sc = data.scorecard;

  const overallScore = Math.round(
    sc.revenue.attainment * 0.30 +
    (sc.pipeline.coverage >= 3 ? 100 : sc.pipeline.coverage >= 2 ? 70 : 40) * 0.20 +
    sc.forecast.accuracy * 0.15 +
    (sc.deal_quality.avg_meddpicc / 25 * 100) * 0.15 +
    sc.competitive.win_rate * 0.10 +
    sc.health.avg * 0.10
  );
  const overallStatus = deriveScoreStatus(overallScore);
  const commitDone = data.commitments.filter(c => c.status === "completed").length;
  const commitPct = Math.round(commitDone / data.commitments.length * 100);
  const readinessDone = data.readiness.filter(r => r.done).length;
  const readinessPct = Math.round(readinessDone / data.readiness.length * 100);

  const phaseLabels: Record<string, string> = {
    weeks_1_4: "Wk 1-4",
    weeks_5_8: "Wk 5-8",
    weeks_9_12: "Wk 9-12",
    pre_qbr_sync: "Pre-QBR",
  };

  return [
    // 1. Cover
    {
      id: "cover",
      title: "Cover",
      content: (
        <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-8 w-8 text-teal-500" />
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Quarterly Business Review</span>
          </div>
          <h1 className="text-5xl font-bold mb-3">QBR Tracking Canvas</h1>
          <p className="text-2xl text-muted-foreground mb-8">{data.quarter}</p>
          <div className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-2xl font-bold mb-8",
            statusBg[overallStatus], statusColors[overallStatus],
          )}>
            <span>{overallScore}</span>
            <span className="text-sm font-normal uppercase">overall score</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <span>{data.ae_name}</span>
            <span>{data.realm_count} accounts</span>
            <span>Prior: {data.prior_qbr}</span>
            <span>Next QBR: {data.next_qbr}</span>
          </div>
        </div>
      ),
    },

    // 2. Quarter Scorecard
    {
      id: "scorecard",
      title: "Quarter Scorecard",
      content: (
        <div>
          <SlideHeader title="Quarter Scorecard" subtitle={`Overall score: ${overallScore} / 100`} />
          <div className="grid grid-cols-3 gap-4">
            <DimensionCard label="Revenue" value={`${sc.revenue.attainment}%`} detail={`${sc.revenue.actual} / ${sc.revenue.target}`} weight={30} status={sc.revenue.status} />
            <DimensionCard label="Pipeline" value={`${sc.pipeline.coverage}x`} detail={`${sc.pipeline.total} pipeline`} weight={20} status={sc.pipeline.status} />
            <DimensionCard label="Forecast" value={`${sc.forecast.accuracy}%`} detail={sc.forecast.detail} weight={15} status={sc.forecast.status} />
            <DimensionCard label="Deal Quality" value={`${sc.deal_quality.avg_meddpicc}`} detail={`${sc.deal_quality.stalled} stalled`} weight={15} status={sc.deal_quality.status} />
            <DimensionCard label="Competitive" value={`${sc.competitive.win_rate}%`} detail={`${sc.competitive.encounters} encounters`} weight={10} status={sc.competitive.status} />
            <DimensionCard label="Acct Health" value={`${sc.health.avg}`} detail={`${sc.health.at_risk} at risk`} weight={10} status={sc.health.status} />
          </div>
        </div>
      ),
    },

    // 3. Revenue & Pipeline
    {
      id: "revenue-pipeline",
      title: "Revenue & Pipeline",
      content: (
        <div>
          <SlideHeader title="Revenue & Pipeline" subtitle="50% of overall score" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <DimensionCard label="Revenue Attainment" value={`${sc.revenue.attainment}%`} detail={`${sc.revenue.actual} / ${sc.revenue.target}`} weight={30} status={sc.revenue.status} large />
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>GREEN: {"\u2265"} 90% attainment</p>
                <p>YELLOW: 75-89% attainment</p>
                <p>RED: {"<"} 75% attainment</p>
              </div>
            </div>
            <div>
              <DimensionCard label="Pipeline Coverage" value={`${sc.pipeline.coverage}x`} detail={`${sc.pipeline.total} pipeline`} weight={20} status={sc.pipeline.status} large />
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>GREEN: {"\u2265"} 3.0x coverage</p>
                <p>YELLOW: 2.0-2.9x coverage</p>
                <p>RED: {"<"} 2.0x coverage (industry min: 3x)</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 4. Forecast & Deal Quality
    {
      id: "forecast-quality",
      title: "Forecast & Deal Quality",
      content: (
        <div>
          <SlideHeader title="Forecast & Deal Quality" subtitle="30% of overall score" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <DimensionCard label="Forecast Accuracy" value={`${sc.forecast.accuracy}%`} detail={sc.forecast.detail} weight={15} status={sc.forecast.status} large />
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Trailing accuracy across commit, upside, pipeline</p>
                <p>Below 70% triggers commit criteria recalibration</p>
              </div>
            </div>
            <div>
              <DimensionCard label="Deal Quality (MEDDPICC)" value={`${sc.deal_quality.avg_meddpicc}/25`} detail={`${sc.deal_quality.stalled} deals stalled 30+ days`} weight={15} status={sc.deal_quality.status} large />
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Avg MEDDPICC for commit-stage deals</p>
                <p>3+ stalled deals triggers qualification review</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 5. Competitive & Account Health
    {
      id: "competitive-health",
      title: "Competitive & Account Health",
      content: (
        <div>
          <SlideHeader title="Competitive & Account Health" subtitle="20% of overall score" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <DimensionCard label="Competitive Win Rate" value={`${sc.competitive.win_rate}%`} detail={`${sc.competitive.encounters} encounters this quarter`} weight={10} status={sc.competitive.status} large />
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>2+ losses to same competitor triggers war room</p>
                <p>GREEN: {"\u2265"} 60%, RED: {"<"} 40%</p>
              </div>
            </div>
            <div>
              <DimensionCard label="Account Health" value={`${sc.health.avg}`} detail={`${sc.health.at_risk} accounts at risk (below 50)`} weight={10} status={sc.health.status} large />
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Portfolio average across {data.realm_count} accounts</p>
                <p>2+ at-risk accounts triggers CA health triage</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 6. Prior QBR Commitments
    {
      id: "commitments",
      title: "Commitments",
      content: (
        <div>
          <SlideHeader title="Prior QBR Commitments" subtitle={`${commitPct}% complete (${commitDone} of ${data.commitments.length})`} />
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Owner</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deadline</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.commitments.map((c, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p>{c.action}</p>
                      {c.outcome && <p className="text-xs text-muted-foreground mt-0.5">{c.outcome}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.owner}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.deadline}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-block px-2 py-1 rounded text-xs font-medium", badgeStyles[c.status])}>
                        {c.status.replace(/_/g, " ")}
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

    // 7. Portfolio Health
    {
      id: "portfolio",
      title: "Portfolio Health",
      content: (
        <div>
          <SlideHeader title="Portfolio Health" subtitle={`${data.realm_count} accounts across portfolio \u00b7 Click a realm to present details`} />
          <div className="space-y-4">
            {data.portfolio.map((p, i) => (
              <button
                key={i}
                onClick={() => onRealmClick ? onRealmClick(p.realm) : window.open(`/present/realm/${p.realm}`, "_blank")}
                className="w-full flex items-center gap-6 border rounded-xl p-5 text-left hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="w-20 text-center shrink-0">
                  <p className={cn("text-3xl font-bold", healthColor(p.health))}>{p.health}</p>
                  <TrendIcon trend={p.trend} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold group-hover:text-primary">{p.realm}</p>
                  <p className="text-sm text-muted-foreground">{p.risk}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-semibold">{p.pipeline}</p>
                  <p className="text-xs text-muted-foreground">Coverage: {p.coverage}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ),
    },

    // 8. Signals & Risks
    {
      id: "signals",
      title: "Signals & Risks",
      content: (
        <div>
          <SlideHeader title="Signals & Risks" subtitle={`${data.signals.length} active signals this quarter`} />
          <div className="space-y-3">
            {data.signals.map((s, i) => (
              <div key={i} className="flex items-start gap-4 border rounded-xl p-4">
                <span className={cn(
                  "inline-block px-2.5 py-1 rounded text-xs font-bold shrink-0 mt-0.5",
                  s.severity === "HIGH" ? "bg-red-500/20 text-red-400" :
                  s.severity === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-green-500/20 text-green-400",
                )}>{s.severity}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{s.signal}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.type} / {s.owner}</p>
                </div>
                <span className={cn("inline-block px-2 py-1 rounded text-xs font-medium shrink-0", badgeStyles[s.status])}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 9. QBR Readiness
    {
      id: "readiness",
      title: "QBR Readiness",
      content: (
        <div>
          <SlideHeader title="QBR Readiness" subtitle={`${readinessPct}% complete (${readinessDone} of ${data.readiness.length} items)`} />
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {data.readiness.map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-base">
                {r.done
                  ? <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  : <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                }
                <span className={r.done ? "text-muted-foreground" : "font-medium"}>{r.item}</span>
                <span className="ml-auto text-xs text-muted-foreground/50 uppercase shrink-0">
                  {phaseLabels[r.phase] || r.phase}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 10. Summary
    {
      id: "summary",
      title: "Summary",
      content: (
        <div>
          <SlideHeader title="Summary & Next Steps" />
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Takeaways</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ArrowDown className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Revenue attainment at {sc.revenue.attainment}%</p>
                    <p className="text-sm text-muted-foreground">Pipeline coverage {sc.pipeline.coverage}x, below 3x benchmark</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowUp className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Forecast accuracy strong at {sc.forecast.accuracy}%</p>
                    <p className="text-sm text-muted-foreground">Commit criteria discipline maintained</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowDown className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">GLOBEX renewal at risk</p>
                    <p className="text-sm text-muted-foreground">Usage declined 30%, health score 38</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Priority Actions</h3>
              <div className="space-y-3 text-sm">
                {data.signals
                  .filter(s => s.severity === "HIGH")
                  .map((s, i) => (
                    <div key={i} className="flex items-start gap-3 border rounded-lg p-3">
                      <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold shrink-0">HIGH</span>
                      <div>
                        <p className="font-medium">{s.signal}</p>
                        <p className="text-muted-foreground mt-0.5">Owner: {s.owner}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-6 p-4 rounded-xl border border-primary/30 bg-primary/5">
                <p className="text-sm font-medium">Next QBR: {data.next_qbr}</p>
                <p className="text-sm text-muted-foreground mt-1">Readiness: {readinessPct}% complete</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];
}
