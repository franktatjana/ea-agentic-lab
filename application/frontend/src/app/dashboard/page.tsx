"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDot,
  Flag,
  Minus,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Presentation,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { HelpPopover } from "@/components/help-popover";
import { QBR_SAMPLE_DATA } from "@/components/presentation/qbr-data";
import type { ScoreStatus } from "@/components/presentation/qbr-data";
import type { DashboardSummary, DashboardNode, DashboardAttentionItem } from "@/types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function TrendIcon({ trend, className }: { trend: string; className?: string }) {
  if (trend === "declining") return <TrendingDown className={cn("h-3.5 w-3.5 text-red-400", className)} />;
  if (trend === "improving") return <TrendingUp className={cn("h-3.5 w-3.5 text-green-400", className)} />;
  return <Minus className={cn("h-3.5 w-3.5 text-muted-foreground", className)} />;
}

function healthColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 75) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function statusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "active") return "default";
  if (status === "cancelled" || status === "closed_lost") return "destructive";
  return "secondary";
}

function PortfolioMetrics({ portfolio }: { portfolio: DashboardSummary["portfolio"] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Active / Total Nodes</p>
            <HelpPopover title="Active / Total Nodes">
              Nodes with status &quot;active&quot; vs. total across all realms. Inactive nodes include cancelled, closed, or paused engagements.
            </HelpPopover>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold">{portfolio.active_nodes}</span>
            <span className="text-sm text-muted-foreground">/ {portfolio.total_nodes}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Avg Health</p>
            <HelpPopover title="Average Health Score">
              Mean health score across all nodes (0-100). Green above 75, yellow 60-75, red below 60. Trend arrow shows portfolio direction.
            </HelpPopover>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-2xl font-bold", healthColor(portfolio.avg_health))}>
              {portfolio.avg_health ?? "-"}
            </span>
            <TrendIcon trend={portfolio.health_trend} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Critical Risks</p>
            <HelpPopover title="Critical Risks">
              Total number of risks rated &quot;critical&quot; across all nodes. These require immediate attention and are flagged in the attention section below.
            </HelpPopover>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-2xl font-bold", portfolio.total_critical_risks > 0 && "text-red-400")}>
              {portfolio.total_critical_risks}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Overdue Actions</p>
            <HelpPopover title="Overdue Actions">
              Action items past their due date across all nodes. High counts indicate execution bottlenecks or resource constraints.
            </HelpPopover>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-2xl font-bold", portfolio.total_overdue_actions > 0 && "text-yellow-400")}>
              {portfolio.total_overdue_actions}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Pipeline (ARR)</p>
            <HelpPopover title="Pipeline ARR">
              Total Annual Recurring Revenue across all active opportunities. Sum of opportunity_arr from node commercial data.
            </HelpPopover>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold">
              {formatCurrency(portfolio.total_pipeline_arr)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Weighted Pipeline</p>
            <HelpPopover title="Weighted Pipeline">
              Pipeline ARR multiplied by win probability for each opportunity. Represents expected revenue value adjusted for deal likelihood.
            </HelpPopover>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(portfolio.weighted_pipeline)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function realmShortName(item: DashboardAttentionItem): string {
  const raw = item.realm_name || item.realm_id || "";
  return raw.split(/[\s_]/)[0];
}

function AttentionSection({ items }: { items: DashboardAttentionItem[] }) {
  const filtered = items.filter((item) => !(item.type === "critical_risks" && item.detail === "0 total risks"));
  if (filtered.length === 0) return null;

  const iconMap: Record<string, React.ReactNode> = {
    health_declining: <Activity className="h-3.5 w-3.5" />,
    critical_risks: <ShieldAlert className="h-3.5 w-3.5" />,
    overdue_actions: <Flag className="h-3.5 w-3.5" />,
    blocking_decisions: <AlertTriangle className="h-3.5 w-3.5" />,
  };

  return (
    <Card className="border-yellow-500/30 bg-yellow-500/[0.03]">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Needs Attention
          <Badge variant="secondary" className="text-xs ml-1">
            {filtered.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="grid gap-1.5">
          {filtered.map((item, i) => (
            <Link
              key={`${item.node_id}-${item.type}-${i}`}
              href={`/realms/${item.realm_id}/nodes/${item.node_id}`}
            >
              <div className="flex items-center gap-3 rounded-md px-2.5 py-1.5 hover:bg-muted/50 transition-colors text-sm group">
                <span className={cn(
                  "shrink-0",
                  item.severity === "critical" ? "text-red-400" : "text-yellow-400"
                )}>
                  {iconMap[item.type] || <CircleDot className="h-3.5 w-3.5" />}
                </span>
                <span className="text-muted-foreground truncate min-w-0">
                  <span className="font-medium text-foreground/70">{realmShortName(item)}</span>
                  {" "}
                  {item.node_name}
                </span>
                <span className="font-medium truncate min-w-0 flex-1">
                  {item.message}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                  {item.detail}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NodeRow({ node }: { node: DashboardNode }) {
  const actionProgress = node.total_actions > 0
    ? Math.round((node.completed_actions / node.total_actions) * 100)
    : 0;

  return (
    <Link href={`/realms/${node.realm_id}/nodes/${node.node_id}`}>
      <div className="flex items-start gap-4 rounded-lg border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
        {/* Health indicator */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-14">
          <span className={cn("text-2xl font-bold", healthColor(node.health_score))}>
            {node.health_score ?? "-"}
          </span>
          <TrendIcon trend={node.health_trend} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm truncate">{node.node_name}</p>
            <Badge variant={statusBadgeVariant(node.status)} className="text-xs capitalize">
              {node.status}
            </Badge>
            {node.stage && (
              <Badge variant="outline" className="text-xs capitalize">
                {node.stage.replace(/_/g, " ")}
              </Badge>
            )}
            {node.archetype && (
              <Badge variant="outline" className="text-xs text-muted-foreground capitalize">
                {node.archetype.replace(/_/g, " ")}
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground">{node.realm_name}</p>

          {/* Signals row */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {node.critical_risks > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <ShieldAlert className="h-3 w-3" />
                {node.critical_risks} critical
              </span>
            )}
            {node.high_risks > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <AlertTriangle className="h-3 w-3" />
                {node.high_risks} high
              </span>
            )}
            {node.overdue_actions > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Flag className="h-3 w-3" />
                {node.overdue_actions} overdue
              </span>
            )}
            {node.blocking_decisions > 0 && (
              <span className="flex items-center gap-1 text-orange-400">
                <AlertTriangle className="h-3 w-3" />
                {node.blocking_decisions} blocking
              </span>
            )}
            {node.next_milestone && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {node.next_milestone}
                {node.next_milestone_date && (
                  <span className="text-muted-foreground/70">({node.next_milestone_date})</span>
                )}
              </span>
            )}
          </div>

          {/* Actions progress */}
          {node.total_actions > 0 && (
            <div className="flex items-center gap-2 pt-0.5">
              <Progress value={actionProgress} className="h-1.5 flex-1 max-w-48" />
              <span className="text-xs text-muted-foreground">
                {node.completed_actions}/{node.total_actions} actions
              </span>
            </div>
          )}
        </div>

        {/* Commercial column */}
        <div className="shrink-0 text-right space-y-1 hidden md:block">
          {node.opportunity_arr != null && node.opportunity_arr > 0 && (
            <div>
              <p className="text-sm font-semibold">{formatCurrency(node.opportunity_arr)}</p>
              <p className="text-xs text-muted-foreground">ARR</p>
            </div>
          )}
          {node.probability != null && (
            <div>
              <p className="text-sm font-medium">{node.probability}%</p>
              <p className="text-xs text-muted-foreground">probability</p>
            </div>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// QBR Tracking Canvas - CY25 Q4 sample data derived from vault
// ---------------------------------------------------------------------------

function deriveScoreStatus(score: number): ScoreStatus {
  if (score >= 75) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

const qbrStatusColors: Record<ScoreStatus, string> = {
  green: "border-green-500/60 text-green-400",
  yellow: "border-yellow-500/60 text-yellow-400",
  red: "border-red-500/60 text-red-400",
};

const qbrStatusBg: Record<ScoreStatus, string> = {
  green: "bg-green-500/10",
  yellow: "bg-yellow-500/10",
  red: "bg-red-500/10",
};

const qbrBadgeStyles: Record<string, string> = {
  completed: "bg-green-500/15 text-green-400",
  in_progress: "bg-blue-500/15 text-blue-400",
  not_started: "bg-muted text-muted-foreground",
  blocked: "bg-red-500/15 text-red-400",
  open: "bg-red-500/15 text-red-400",
  mitigating: "bg-yellow-500/15 text-yellow-400",
  resolved: "bg-green-500/15 text-green-400",
};

const QBR_DATA = QBR_SAMPLE_DATA;

function QbrTrackingSection() {
  const d = QBR_DATA;
  const sc = d.scorecard;

  const overallScore = Math.round(
    sc.revenue.attainment * 0.30 +
    (sc.pipeline.coverage >= 3 ? 100 : sc.pipeline.coverage >= 2 ? 70 : 40) * 0.20 +
    sc.forecast.accuracy * 0.15 +
    (sc.deal_quality.avg_meddpicc / 25 * 100) * 0.15 +
    sc.competitive.win_rate * 0.10 +
    sc.health.avg * 0.10
  );
  const overallStatus = deriveScoreStatus(overallScore);

  const commitDone = d.commitments.filter(c => c.status === "completed").length;
  const commitPct = Math.round(commitDone / d.commitments.length * 100);
  const readinessDone = d.readiness.filter(r => r.done).length;
  const readinessPct = Math.round(readinessDone / d.readiness.length * 100);

  const dimensions = [
    { label: "Revenue", value: `${sc.revenue.attainment}%`, detail: `${sc.revenue.actual} / ${sc.revenue.target}`, weight: 30, status: sc.revenue.status,
      help: "Quarterly revenue closed vs. target. GREEN >= 90%, YELLOW 75-89%, RED < 75%. Includes new business, expansion, and renewal." },
    { label: "Pipeline", value: `${sc.pipeline.coverage}x`, detail: `${sc.pipeline.total} pipeline`, weight: 20, status: sc.pipeline.status,
      help: "Total qualified pipeline divided by remaining target. Industry benchmark is 3x minimum. GREEN >= 3.0x, YELLOW 2.0-2.9x, RED < 2.0x." },
    { label: "Forecast", value: `${sc.forecast.accuracy}%`, detail: sc.forecast.detail, weight: 15, status: sc.forecast.status,
      help: "Trailing forecast accuracy across commit, upside, and pipeline categories. GREEN >= 80%, YELLOW 70-79%, RED < 70%. Low accuracy triggers commit criteria recalibration." },
    { label: "Deal Quality", value: `${sc.deal_quality.avg_meddpicc}`, detail: `${sc.deal_quality.stalled} stalled`, weight: 15, status: sc.deal_quality.status,
      help: "Average MEDDPICC score (0-25) for commit-stage deals plus stalled deal count (30+ days no movement). GREEN: avg >= 18 and stalled <= 1. RED: avg < 12 or stalled >= 3." },
    { label: "Competitive", value: `${sc.competitive.win_rate}%`, detail: `${sc.competitive.encounters} encounters`, weight: 10, status: sc.competitive.status,
      help: "Win rate across all competitive encounters this quarter. GREEN >= 60%, YELLOW 40-59%, RED < 40%. Repeated losses to the same competitor trigger a competitive war room." },
    { label: "Acct Health", value: `${sc.health.avg}`, detail: `${sc.health.at_risk} at risk`, weight: 10, status: sc.health.status,
      help: "Portfolio-average health score (0-100) across all realms. At-risk = score below 50. GREEN: avg >= 70 and 0 at risk. RED: avg < 50 or >= 2 at risk. Triggers CA health triage." },
  ];

  const phaseLabels: Record<string, string> = {
    weeks_1_4: "Wk 1-4",
    weeks_5_8: "Wk 5-8",
    weeks_9_12: "Wk 9-12",
    pre_qbr_sync: "Pre-QBR",
  };

  return (
    <Card>
      {/* Header */}
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-500" />
            QBR Tracking Canvas
            <Badge variant="outline" className="text-xs">{d.quarter}</Badge>
            <HelpPopover title="QBR Tracking Canvas">
              Continuous tracking instrument between Quarterly Business Reviews (PB_603). Monitors 6 weighted scoring dimensions, prior QBR commitments, portfolio health across all accounts, active signals and risks, and preparation readiness. Updated weekly throughout the quarter. Overall score: weighted sum across all dimensions (0-100). GREEN {"\u2265"} 75, YELLOW 50-74, RED {"<"} 50.
            </HelpPopover>
            <button
              onClick={() => window.open("/present/qbr", "_blank")}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Presentation className="h-3.5 w-3.5" />
              Present
            </button>
          </CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">{d.ae_name}</span>
            <span className="text-muted-foreground">{d.realm_count} accounts</span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Readiness</span>
              <Progress value={readinessPct} className="h-1.5 w-16" />
              <span className="font-medium">{readinessPct}%</span>
              <HelpPopover title="QBR Readiness">
                Percentage of preparation checklist items completed. Maps to PB_603 quarter-long cadence across 4 phases.
              </HelpPopover>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded font-bold",
                qbrStatusBg[overallStatus], qbrStatusColors[overallStatus],
              )}>
                <span>{overallScore}</span>
                <span className="text-[9px] font-normal uppercase">score</span>
              </div>
              <HelpPopover title="Overall QBR Score">
                Weighted sum: Revenue (30%) + Pipeline (20%) + Forecast (15%) + Deal Quality (15%) + Competitive (10%) + Account Health (10%). Score 0-100.
              </HelpPopover>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
          <span>Prior QBR: {d.prior_qbr}</span>
          <span>Next QBR: {d.next_qbr}</span>
          <span>Updated: {d.last_updated}</span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-4">
        {/* Quarter Scorecard */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-500">Quarter Scorecard</p>
            <HelpPopover title="Quarter Scorecard">
              Six key metrics aligned with PB_603 scoring dimensions, updated weekly. Each dimension has a weight that contributes to the overall QBR score. Thresholds follow PB_603 decision logic: pipeline below 2x triggers immediate action, forecast below 70% triggers commit criteria recalibration, 2+ at-risk accounts triggers health triage escalation.
            </HelpPopover>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {dimensions.map(dim => (
              <div key={dim.label} className={cn("rounded-md border-t-2 p-2.5", qbrStatusColors[dim.status], qbrStatusBg[dim.status])}>
                <div className="flex items-center gap-1">
                  <p className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground">{dim.label}</p>
                  <HelpPopover title={dim.label}>{dim.help}</HelpPopover>
                </div>
                <p className="text-lg font-bold mt-0.5">{dim.value}</p>
                <p className="text-[10px] text-muted-foreground">{dim.detail}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">Weight: {dim.weight}%</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Commitments + Portfolio Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Commitment Tracker */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-500">
                Prior QBR Commitments ({commitPct}% complete)
              </p>
              <HelpPopover title="Prior QBR Commitments">
                Action items from the previous QBR with current status. Every item must have an owner and deadline. Blocked items must include a reason. Items past deadline without completion are flagged. 2+ blocked commitments triggers a warning alert in PB_603.
              </HelpPopover>
            </div>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Action</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Owner</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d.commitments.map((c, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-2 py-1.5">
                        <p className="truncate max-w-[200px]" title={c.action}>{c.action}</p>
                        {c.outcome && <p className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={c.outcome}>{c.outcome}</p>}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">{c.owner}</td>
                      <td className="px-2 py-1.5">
                        <span className={cn("inline-block px-1.5 py-0.5 rounded text-[10px] font-medium", qbrBadgeStyles[c.status])}>
                          {c.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Portfolio Health */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-500">Portfolio Health</p>
              <HelpPopover title="Portfolio Health">
                Account health and pipeline across all realms in the AE portfolio. Health scores (0-100) come from 5 components: product adoption, engagement, relationship, commercial, and risk profile. Scores older than 14 days are flagged as stale. 2+ accounts below 50 triggers an intervention alert.
              </HelpPopover>
            </div>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Account</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Health</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Trend</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Pipeline</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {d.portfolio.map((p, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-2 py-1.5 font-medium">{p.realm}</td>
                      <td className="px-2 py-1.5">
                        <span className={healthColor(p.health)}>{p.health}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <TrendIcon trend={p.trend} />
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{p.pipeline}</td>
                      <td className="px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={p.risk}>{p.risk}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Separator />

        {/* Signals & Risks + Readiness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Signals & Risks */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-500">Signals & Risks</p>
              <HelpPopover title="Signals & Risks">
                Active risks, competitive encounters, and PB_603 decision rules triggered this quarter. Types: Pipeline Risk, Competitive, Forecast, Account Health, Stalled Deal. Sorted by severity. PB_603 defines 8 decision rules that auto-generate signals, for example: pipeline below 2x, repeated losses to same competitor, 3+ stalled deals.
              </HelpPopover>
            </div>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Signal</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Severity</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d.signals.map((s, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-2 py-1.5">
                        <p className="truncate max-w-[220px]" title={s.signal}>{s.signal}</p>
                        <p className="text-[10px] text-muted-foreground">{s.type} / {s.owner}</p>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={cn(
                          "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold",
                          s.severity === "HIGH" ? "bg-red-500/20 text-red-400" :
                          s.severity === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-green-500/20 text-green-400",
                        )}>{s.severity}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={cn("inline-block px-1.5 py-0.5 rounded text-[10px] font-medium", qbrBadgeStyles[s.status])}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QBR Readiness */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-500">
                QBR Readiness ({readinessPct}%)
              </p>
              <HelpPopover title="QBR Readiness">
                Preparation checklist mapped to PB_603 quarter-long cadence. Wk 1-4: foundation (targets, baseline pipeline). Wk 5-8: continuous capture (health scores, competitive encounters, win/loss retrospectives). Wk 9-12: synthesis (MEDDPICC assessments, pipeline snapshot, narrative). Pre-QBR: alignment sync with SA, CA, CI, VE agents. GREEN {"\u2265"} 80%, YELLOW 50-79%, RED {"<"} 50%.
              </HelpPopover>
            </div>
            <div className="space-y-1">
              {d.readiness.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  {r.done
                    ? <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                    : <Circle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  }
                  <span className={r.done ? "text-muted-foreground" : ""}>{r.item}</span>
                  <span className="ml-auto text-[9px] text-muted-foreground/50 uppercase shrink-0">
                    {phaseLabels[r.phase] || r.phase}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PortfolioByRealm({ nodes }: { nodes: DashboardNode[] }) {
  const byRealm = new Map<string, { realm_name: string; nodes: DashboardNode[] }>();
  for (const n of nodes) {
    const existing = byRealm.get(n.realm_id);
    if (existing) {
      existing.nodes.push(n);
    } else {
      byRealm.set(n.realm_id, { realm_name: n.realm_name, nodes: [n] });
    }
  }

  return (
    <div className="space-y-6">
      {Array.from(byRealm.entries()).map(([realmId, { realm_name, nodes: realmNodes }]) => {
        const active = realmNodes.filter(n => n.status === "active");
        const realmArr = active.reduce((sum, n) => sum + (n.opportunity_arr || 0), 0);
        const healthScores = realmNodes.filter(n => n.health_score !== null).map(n => n.health_score!);
        const avgHealth = healthScores.length > 0 ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) : null;

        return (
          <div key={realmId}>
            <div className="flex items-center justify-between mb-3">
              <Link href={`/realms/${realmId}`} className="flex items-center gap-2 group">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold group-hover:text-primary transition-colors">{realm_name}</h3>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{realmNodes.length} node{realmNodes.length !== 1 ? "s" : ""}</span>
                {avgHealth !== null && (
                  <span className={healthColor(avgHealth)}>Health {avgHealth}</span>
                )}
                {realmArr > 0 && (
                  <span>{formatCurrency(realmArr)} pipeline</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {realmNodes.map(node => (
                <NodeRow key={node.node_id} node={node} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: api.getDashboardSummary,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Portfolio overview across {data.portfolio.total_realms} realm{data.portfolio.total_realms !== 1 ? "s" : ""} and {data.portfolio.total_nodes} node{data.portfolio.total_nodes !== 1 ? "s" : ""}.
        </p>
      </div>

      <PortfolioMetrics portfolio={data.portfolio} />

      <AttentionSection items={data.attention_items} />

      <QbrTrackingSection />

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Portfolio</h2>
          <button
            onClick={() => window.open("/present/portfolio", "_blank")}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Presentation className="h-3.5 w-3.5" />
            Present
          </button>
        </div>
        <PortfolioByRealm nodes={data.nodes} />
      </div>
    </div>
  );
}
