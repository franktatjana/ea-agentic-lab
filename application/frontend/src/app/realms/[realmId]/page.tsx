"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Activity,
  Users,
  Target,
  TrendingUp,
  Globe,
  MapPin,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/metric-card";
import { HealthBar } from "@/components/health-bar";
import { StatusBadge } from "@/components/badges";
import { HelpPopover } from "@/components/help-popover";
import type { Realm, NodeSummary } from "@/types";

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

function ProfileField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: unknown;
  icon?: React.ElementType;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{String(value)}</p>
      </div>
    </div>
  );
}

function ProfileTab({ profile }: { profile: Record<string, unknown> }) {
  const company = (profile.company_info || profile) as Record<string, unknown>;
  const relationship = profile.relationship as Record<string, unknown> | undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Company Information
            <HelpPopover title="Company Information">
              Firmographic data about the customer: industry, size, revenue,
              and location. This context helps agents tailor their engagement
              strategy and identify relevant use cases.
            </HelpPopover>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <ProfileField label="Industry" value={company.industry || profile.industry} icon={Briefcase} />
          <ProfileField label="Employees" value={company.employees || profile.employees} icon={Users} />
          <ProfileField label="Revenue" value={company.revenue || profile.revenue} icon={DollarSign} />
          <ProfileField label="Headquarters" value={company.headquarters || profile.headquarters} icon={MapPin} />
          <ProfileField label="Region" value={company.region || profile.region} icon={Globe} />
          {!!(company.business_description || profile.business_description) && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">Business Description</p>
              <p className="text-sm mt-1">{String(company.business_description || profile.business_description)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {relationship && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
            Relationship
            <HelpPopover title="Relationship context">
              Key relationship attributes such as contract terms, partnership
              level, and engagement history. Used by agents to calibrate the
              tone and depth of their interactions.
            </HelpPopover>
          </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {Object.entries(relationship).map(([key, val]) => (
              <ProfileField key={key} label={key.replace(/_/g, " ")} value={val} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompetitiveTab({ profile }: { profile: Record<string, unknown> }) {
  const competitive = (profile.competitive || profile.competitive_landscape) as Record<string, unknown> | undefined;
  const competitors = (competitive?.competitors || profile.competitors) as Record<string, unknown>[] | string[] | undefined;
  const differentiation = (competitive?.differentiation || competitive?.differentiation_points || profile.differentiation) as string[] | Record<string, unknown>[] | undefined;

  return (
    <div className="space-y-6">
      {competitors && Array.isArray(competitors) && competitors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Competitors
              <HelpPopover title="Competitor analysis">
                Known competitors in this account, their strengths,
                weaknesses, and threat levels. The CI Agent uses this to
                generate battlecards and counter-positioning strategies.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competitors.map((comp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  {typeof comp === "string" ? (
                    <p className="text-sm">{comp}</p>
                  ) : (
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">{String((comp as Record<string, unknown>).name || `Competitor ${i + 1}`)}</p>
                      {!!(comp as Record<string, unknown>).strengths && (
                        <p className="text-xs text-muted-foreground">
                          Strengths: {String((comp as Record<string, unknown>).strengths)}
                        </p>
                      )}
                      {!!(comp as Record<string, unknown>).weaknesses && (
                        <p className="text-xs text-muted-foreground">
                          Weaknesses: {String((comp as Record<string, unknown>).weaknesses)}
                        </p>
                      )}
                      {!!(comp as Record<string, unknown>).threat_level && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {String((comp as Record<string, unknown>).threat_level)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {differentiation && Array.isArray(differentiation) && differentiation.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Differentiation Points
              <HelpPopover title="Differentiation">
                Key areas where your solution stands out against competitors
                in this account. The SA Agent uses these to frame technical
                discussions and proof-of-value demonstrations.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {differentiation.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{typeof point === "string" ? point : String((point as Record<string, unknown>).description || JSON.stringify(point))}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!competitors?.length && !differentiation?.length && (
        <p className="text-muted-foreground text-sm">No competitive data available.</p>
      )}
    </div>
  );
}

function GrowthTab({ profile }: { profile: Record<string, unknown> }) {
  const growth = (profile.growth || profile.account_growth) as Record<string, unknown> | undefined;
  const objectives = (growth?.objectives || growth?.account_objectives || profile.account_objectives || profile.objectives) as string[] | Record<string, unknown>[] | undefined;
  const whitespace = (growth?.whitespace || growth?.whitespace_analysis || profile.whitespace || profile.whitespace_analysis) as Record<string, unknown> | string[] | undefined;

  return (
    <div className="space-y-6">
      {objectives && Array.isArray(objectives) && objectives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Account Objectives
              <HelpPopover title="Account objectives">
                Strategic goals for this account, such as expanding into new
                business units, increasing adoption, or renewing at a higher
                tier. These guide the AE Agent&apos;s account planning.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  <span>{typeof obj === "string" ? obj : String((obj as Record<string, unknown>).description || (obj as Record<string, unknown>).objective || JSON.stringify(obj))}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {whitespace && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Whitespace Analysis
              <HelpPopover title="Whitespace analysis">
                Identifies untapped opportunities within this account, such as
                products not yet adopted, departments not yet engaged, or use
                cases not yet explored. Feeds into expansion planning.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(whitespace) ? (
              <ul className="space-y-2">
                {whitespace.map((item, i) => (
                  <li key={i} className="text-sm p-2 rounded bg-muted/30">
                    {typeof item === "string" ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2">
                {Object.entries(whitespace).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground">{key.replace(/_/g, " ")}</p>
                    <p className="text-sm">{typeof val === "string" ? val : JSON.stringify(val)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!objectives?.length && !whitespace && (
        <p className="text-muted-foreground text-sm">No growth data available.</p>
      )}
    </div>
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

      {profile && (
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="competitive">Competitive</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <ProfileTab profile={profile} />
          </TabsContent>

          <TabsContent value="competitive" className="mt-4">
            <CompetitiveTab profile={profile} />
          </TabsContent>

          <TabsContent value="growth" className="mt-4">
            <GrowthTab profile={profile} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
