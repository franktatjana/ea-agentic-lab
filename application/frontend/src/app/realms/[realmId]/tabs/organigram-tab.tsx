"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Building2, GitBranch } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpPopover } from "@/components/help-popover";
import { EmptyState, TabHeader } from "./shared";

function PersonBadge({ name, title }: { name: string; title?: string }) {
  return (
    <div className="text-sm">
      <span className="font-medium">{name}</span>
      {!!title && <span className="text-xs text-muted-foreground ml-1.5">{title}</span>}
    </div>
  );
}

const engagementColors: Record<string, string> = {
  ACTIVE: "text-green-400 border-green-400/30",
  EXPLORING: "text-blue-400 border-blue-400/30",
  NOT_ENGAGED: "text-muted-foreground",
};
const relevanceColors: Record<string, string> = {
  HIGH: "text-green-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-muted-foreground",
};
const decisionRoleColors: Record<string, string> = {
  final_authority: "bg-red-400/10 text-red-400",
  approver: "bg-orange-400/10 text-orange-400",
  recommender: "bg-blue-400/10 text-blue-400",
  evaluator: "bg-purple-400/10 text-purple-400",
};

export function OrganigramTab({ realmId }: { realmId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["organigram", realmId],
    queryFn: () => api.getOrganigram(realmId),
    enabled: !!realmId,
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!data || Object.keys(data).length === 0) return <EmptyState message="No organigram data available." />;

  const ceo = (data.ceo || {}) as Record<string, unknown>;
  const businessLines = (data.business_lines || []) as Record<string, unknown>[];
  const corporateFunctions = (data.corporate_functions || []) as Record<string, unknown>[];
  const decisionChains = (data.decision_chains || []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <TabHeader pageSection="organigram" />
      {Object.keys(ceo).length > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{String(ceo.name)}</p>
              <p className="text-xs text-muted-foreground">{String(ceo.title)}</p>
              {!!ceo.tenure_start && <p className="text-xs text-muted-foreground">Since {String(ceo.tenure_start)}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {businessLines.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business Lines
            <HelpPopover title="Business lines">
              Organizational structure mapped by the Account Intelligence Agent.
              Relevance scores indicate how well each department aligns with your
              product portfolio.
            </HelpPopover>
          </h3>
          <div className="space-y-4">
            {businessLines.map((bl, i) => {
              const head = (bl.head || {}) as Record<string, unknown>;
              const departments = (bl.departments || []) as Record<string, unknown>[];
              return (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{String(bl.name)}</span>
                      <div className="flex items-center gap-1.5">
                        {!!bl.revenue_contribution && (
                          <Badge variant="secondary" className="text-xs">{String(bl.revenue_contribution)}</Badge>
                        )}
                        {!!bl.employee_count && (
                          <span className="text-xs text-muted-foreground">{String(bl.employee_count)} people</span>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.keys(head).length > 0 && <PersonBadge name={String(head.name)} title={String(head.title)} />}
                    {departments.length > 0 && (
                      <div className="space-y-2 pl-4 border-l-2 border-border">
                        {departments.map((dept, j) => {
                          const deptHead = (dept.head || {}) as Record<string, unknown>;
                          const relevance = (dept.relevance_to_vendor || {}) as Record<string, unknown>;
                          const products = (relevance.products_applicable || []) as string[];
                          return (
                            <div key={j} className="p-2.5 rounded bg-muted/30 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium">{String(dept.name)}</span>
                                {!!dept.engagement_status && (
                                  <Badge variant="outline" className={`text-xs ${engagementColors[String(dept.engagement_status)] || ""}`}>
                                    {String(dept.engagement_status).replace(/_/g, " ")}
                                  </Badge>
                                )}
                              </div>
                              {Object.keys(deptHead).length > 0 && (
                                <PersonBadge name={String(deptHead.name)} title={String(deptHead.title)} />
                              )}
                              {!!relevance.score && (
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Relevance:</span>{" "}
                                  <span className={relevanceColors[String(relevance.score)] || ""}>{String(relevance.score)}</span>
                                  {!!relevance.reason && <span className="text-muted-foreground ml-1.5">· {String(relevance.reason)}</span>}
                                </p>
                              )}
                              {products.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {products.map((p, k) => (
                                    <Badge key={k} variant="outline" className="text-xs">{p}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {corporateFunctions.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-muted-foreground">Corporate Functions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {corporateFunctions.map((fn, i) => {
              const fnHead = (fn.head || {}) as Record<string, unknown>;
              const subFunctions = (fn.sub_functions || []) as Record<string, unknown>[];
              return (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{String(fn.name)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.keys(fnHead).length > 0 && <PersonBadge name={String(fnHead.name)} title={String(fnHead.title)} />}
                    {subFunctions.length > 0 && (
                      <div className="space-y-1.5 pl-4 border-l-2 border-border">
                        {subFunctions.map((sf, j) => {
                          const sfHead = (sf.head || {}) as Record<string, unknown>;
                          return (
                            <div key={j} className="text-sm">
                              <span className="font-medium">{String(sf.name)}</span>
                              {Object.keys(sfHead).length > 0 && (
                                <span className="text-xs text-muted-foreground ml-1.5">
                                  {String(sfHead.name)}, {String(sfHead.title)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {decisionChains.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Decision Chains
            <HelpPopover title="Decision chains">
              Mapped purchasing decision flows showing who has authority, who
              recommends, and who evaluates for each domain. Critical for
              navigating complex deal cycles.
            </HelpPopover>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decisionChains.map((dc, i) => {
              const chain = (dc.chain || []) as Record<string, unknown>[];
              return (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{String(dc.domain)}</CardTitle>
                    {!!dc.description && (
                      <p className="text-xs text-muted-foreground">{String(dc.description)}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {chain.map((person, j) => (
                        <div key={j} className="flex items-center gap-2">
                          {j > 0 && <div className="w-px h-3 bg-border ml-2 -mt-2" />}
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="text-sm">{String(person.name)}</span>
                            <Badge className={`text-xs ml-auto ${decisionRoleColors[String(person.role_in_decision)] || ""}`}>
                              {String(person.role_in_decision || "").replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
