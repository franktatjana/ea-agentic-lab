"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Activity,
  LayoutGrid,
  List,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { Separator } from "@/components/ui/separator";
import { HelpPopover } from "@/components/help-popover";
import { cn } from "@/lib/utils";
import type { Realm, NodeSummary } from "@/types";

type RealmWithNodes = Realm & { nodeSummaries?: NodeSummary[] };

function getRealmStats(realm: RealmWithNodes) {
  const nodes = realm.nodeSummaries || [];
  const avgHealth =
    nodes.length > 0
      ? Math.round(
          nodes.reduce((sum, n) => sum + (n.health_score || 0), 0) /
            nodes.length
        )
      : null;
  const atRisk = nodes.filter((n) => (n.critical_risks || 0) > 0).length;
  return { nodes, avgHealth, atRisk };
}

function RealmCard({ realm }: { realm: RealmWithNodes }) {
  const { nodes, avgHealth, atRisk } = getRealmStats(realm);

  return (
    <Link href={`/realms/${realm.realm_id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{realm.name}</CardTitle>
                <div className="flex gap-2 mt-1">
                  {realm.tier && (
                    <Badge variant="secondary" className="text-xs">
                      {realm.tier}
                    </Badge>
                  )}
                  {realm.industry && (
                    <Badge variant="outline" className="text-xs">
                      {realm.industry}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{realm.nodes.length}</p>
              <p className="text-xs text-muted-foreground">Nodes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {avgHealth !== null ? avgHealth : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Avg Health</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{atRisk}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
          </div>

          {nodes.length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="space-y-2">
                {nodes.map((node) => (
                  <div
                    key={node.node_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate text-muted-foreground">
                      {node.name || node.node_id.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      {node.health_score != null && (
                        <span className="flex items-center gap-1 text-xs">
                          <Activity className="h-3 w-3" />
                          {node.health_score}
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {node.status || "active"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function RealmRow({ realm }: { realm: RealmWithNodes }) {
  const { nodes, avgHealth, atRisk } = getRealmStats(realm);

  return (
    <Link href={`/realms/${realm.realm_id}`}>
      <div className="flex items-center gap-4 rounded-lg border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{realm.name}</p>
            {realm.tier && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {realm.tier}
              </Badge>
            )}
            {realm.industry && (
              <Badge variant="outline" className="text-xs shrink-0">
                {realm.industry}
              </Badge>
            )}
          </div>
          {nodes.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {nodes
                .map((n) => n.name || n.node_id.replace(/_/g, " "))
                .join(", ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-6 shrink-0 text-center">
          <div>
            <p className="text-lg font-bold">{realm.nodes.length}</p>
            <p className="text-xs text-muted-foreground">Nodes</p>
          </div>
          <div>
            <p className="text-lg font-bold">
              {avgHealth !== null ? avgHealth : "-"}
            </p>
            <p className="text-xs text-muted-foreground">Health</p>
          </div>
          <div>
            <p
              className={cn(
                "text-lg font-bold",
                atRisk > 0 && "text-destructive"
              )}
            >
              {atRisk}
            </p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [view, setView] = useState<"tiles" | "list">("tiles");

  const { data: realms, isLoading } = useQuery({
    queryKey: ["realms"],
    queryFn: api.listRealms,
  });

  const { data: allNodes } = useQuery({
    queryKey: ["allNodes", realms?.map((r) => r.realm_id)],
    queryFn: async () => {
      if (!realms) return {};
      const result: Record<string, NodeSummary[]> = {};
      await Promise.all(
        realms.map(async (r) => {
          try {
            result[r.realm_id] = await api.listNodes(r.realm_id);
          } catch {
            result[r.realm_id] = [];
          }
        })
      );
      return result;
    },
    enabled: !!realms && realms.length > 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading realms...</p>
      </div>
    );
  }

  const totalNodes = realms?.reduce((sum, r) => sum + r.nodes.length, 0) || 0;
  const nodeData = allNodes || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <HelpPopover title="Dashboard overview">
            The dashboard shows all your realms (customer accounts) and their
            engagement nodes. Each realm card shows the number of nodes, average
            health score, and how many nodes have critical risks. Click a realm
            to drill into its details.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          Overview of all realms, nodes, and their current status.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Realms" value={realms?.length || 0} />
        <MetricCard label="Total Nodes" value={totalNodes} />
        <MetricCard
          label="Active Nodes"
          value={
            Object.values(nodeData)
              .flat()
              .filter((n) => n.status === "active").length
          }
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Realms</h2>
        <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
          <Button
            variant={view === "tiles" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setView("tiles")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setView("list")}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {view === "tiles" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {realms?.map((realm) => (
            <RealmCard
              key={realm.realm_id}
              realm={{ ...realm, nodeSummaries: nodeData[realm.realm_id] }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {realms?.map((realm) => (
            <RealmRow
              key={realm.realm_id}
              realm={{ ...realm, nodeSummaries: nodeData[realm.realm_id] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
