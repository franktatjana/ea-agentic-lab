"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/metric-card";
import { HealthBar } from "@/components/health-bar";
import { StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { HelpPopover } from "@/components/help-popover";
import { CreateNodeDialog } from "@/components/create-node-dialog";
import { ProfileTab } from "./tabs/profile-tab";
import { AccountTab } from "./tabs/account-tab";
import { IndustryTab } from "./tabs/industry-tab";
import { StrategyTab } from "./tabs/strategy-tab";
import { OpportunitiesTab } from "./tabs/opportunities-tab";
import { ActivitiesTab } from "./tabs/activities-tab";
import { OrganigramTab } from "./tabs/organigram-tab";
import { VendorsTab } from "./tabs/vendors-tab";
import { CompetitiveTab } from "./tabs/competitive-tab";
import { GrowthTab } from "./tabs/growth-tab";
import type { NodeSummary } from "@/types";

function NodeCard({
  node,
  realmId,
}: {
  node: NodeSummary;
  realmId: string;
}) {
  return (
    <Link href={`/realms/${realmId}/nodes/${node.node_id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium">{node.name || node.node_id}</p>
              <div className="flex items-center gap-2">
                {node.status && <StatusBadge status={node.status} />}
                {node.operating_mode && (
                  <Badge variant="secondary" className="text-xs">
                    {node.operating_mode}
                  </Badge>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
          </div>
          {node.health_score != null && (
            <div className="mt-3">
              <HealthBar score={node.health_score} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function RealmDetailPage() {
  const params = useParams();
  const realmId = params.realmId as string;

  const {
    data: realm,
    isLoading: realmLoading,
    error: realmError,
  } = useQuery({
    queryKey: ["realm", realmId],
    queryFn: () => api.getRealm(realmId),
    enabled: !!realmId,
  });

  const { data: nodes, isLoading: nodesLoading } = useQuery({
    queryKey: ["nodes", realmId],
    queryFn: () => api.listNodes(realmId),
    enabled: !!realmId,
  });

  const [createOpen, setCreateOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["realmProfile", realmId],
    queryFn: () => api.getRealmProfile(realmId),
    enabled: !!realmId,
  });

  if (realmLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading realm...</p>
      </div>
    );
  }

  if (realmError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">Failed to load realm: {realmError.message}</p>
      </div>
    );
  }

  const totalNodes = nodes?.length || 0;
  const avgHealth =
    nodes && nodes.length > 0
      ? Math.round(nodes.reduce((sum, n) => sum + (n.health_score || 0), 0) / nodes.length)
      : 0;
  const criticalRisks = nodes?.reduce((sum, n) => sum + (n.critical_risks || 0), 0) || 0;
  const overdueActions = nodes?.reduce((sum, n) => sum + (n.overdue_actions || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{realm?.name || realmId}</h1>
            <HelpPopover title="What is a Realm?">
              A realm represents a customer account or engagement context. It
              contains nodes (active initiatives), a company profile, competitive
              landscape, and growth analysis. Metrics here aggregate across all
              nodes in this realm.
            </HelpPopover>
          </div>
          <div className="flex gap-2 mt-1">
            {realm?.tier && (
              <Badge variant="secondary" className="text-xs">
                {realm.tier}
              </Badge>
            )}
            {realm?.industry && (
              <Badge variant="outline" className="text-xs">
                {realm.industry}
              </Badge>
            )}
            {realm?.region && (
              <Badge variant="outline" className="text-xs">
                {realm.region}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Nodes" value={totalNodes} />
        <MetricCard label="Avg Health" value={avgHealth} />
        <MetricCard label="Critical Risks" value={criticalRisks} />
        <MetricCard label="Overdue Actions" value={overdueActions} />
      </div>

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold">Nodes</h2>
          <HelpPopover title="What are Nodes?">
            Nodes are active engagement initiatives within this realm, such as
            a product deployment, expansion project, or renewal cycle. Each node
            tracks its own health score, risks, actions, stakeholders, and
            blueprint progress independently.
          </HelpPopover>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="ml-auto">
            <Plus className="h-4 w-4 mr-1" /> New Node
          </Button>
        </div>
        {nodesLoading ? (
          <p className="text-muted-foreground text-sm">Loading nodes...</p>
        ) : nodes && nodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <NodeCard key={node.node_id} node={node} realmId={realmId} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No nodes found.</p>
        )}
      </div>

      <Separator />

      <Tabs defaultValue="profile">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="industry">Industry</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="organigram">Organigram</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          {profile ? <ProfileTab profile={profile} /> : <p className="text-muted-foreground text-sm">Loading profile...</p>}
        </TabsContent>

        <TabsContent value="account" className="mt-4">
          <AccountTab realmId={realmId} />
        </TabsContent>

        <TabsContent value="industry" className="mt-4">
          <IndustryTab realmId={realmId} />
        </TabsContent>

        <TabsContent value="strategy" className="mt-4">
          {profile ? <StrategyTab realmId={realmId} profile={profile} /> : <p className="text-muted-foreground text-sm">Loading...</p>}
        </TabsContent>

        <TabsContent value="opportunities" className="mt-4">
          <OpportunitiesTab realmId={realmId} />
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          {profile ? <ActivitiesTab profile={profile} /> : <p className="text-muted-foreground text-sm">Loading...</p>}
        </TabsContent>

        <TabsContent value="organigram" className="mt-4">
          <OrganigramTab realmId={realmId} />
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <VendorsTab realmId={realmId} />
        </TabsContent>

        <TabsContent value="competitive" className="mt-4">
          {profile ? <CompetitiveTab profile={profile} /> : <p className="text-muted-foreground text-sm">Loading...</p>}
        </TabsContent>

        <TabsContent value="growth" className="mt-4">
          {profile ? <GrowthTab profile={profile} /> : <p className="text-muted-foreground text-sm">Loading...</p>}
        </TabsContent>
      </Tabs>

      <CreateNodeDialog realmId={realmId} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
