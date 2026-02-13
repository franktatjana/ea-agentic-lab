"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
  CircleDot,
  Flag,
  Minus,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
          <p className="text-xs text-muted-foreground">Active / Total Nodes</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold">{portfolio.active_nodes}</span>
            <span className="text-sm text-muted-foreground">/ {portfolio.total_nodes}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Avg Health</p>
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
          <p className="text-xs text-muted-foreground">Critical Risks</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-2xl font-bold", portfolio.total_critical_risks > 0 && "text-red-400")}>
              {portfolio.total_critical_risks}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Overdue Actions</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-2xl font-bold", portfolio.total_overdue_actions > 0 && "text-yellow-400")}>
              {portfolio.total_overdue_actions}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pipeline (ARR)</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold">
              {formatCurrency(portfolio.total_pipeline_arr)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Weighted Pipeline</p>
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

function AttentionSection({ items }: { items: DashboardAttentionItem[] }) {
  if (items.length === 0) return null;

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
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="grid gap-1.5">
          {items.map((item, i) => (
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

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Portfolio</h2>
        <PortfolioByRealm nodes={data.nodes} />
      </div>
    </div>
  );
}
