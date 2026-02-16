"use client";

import { useQuery } from "@tanstack/react-query";
import { Target, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpPopover } from "@/components/help-popover";
import { EmptyState } from "./shared";

export function OpportunitiesTab({ realmId }: { realmId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["opportunities", realmId],
    queryFn: () => api.getOpportunities(realmId),
    enabled: !!realmId,
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!data || Object.keys(data).length === 0) return <EmptyState message="No opportunity data available." />;

  const opportunities = (data.opportunities || []) as Record<string, unknown>[];
  const summary = (data.summary || {}) as Record<string, unknown>;

  const confidenceColors: Record<string, string> = {
    high: "text-green-400 border-green-400/30",
    medium: "text-yellow-400 border-yellow-400/30",
    low: "text-muted-foreground",
  };
  const typeColors: Record<string, string> = {
    cross_sell: "bg-blue-400/10 text-blue-400",
    expansion: "bg-green-400/10 text-green-400",
    new_use_case: "bg-purple-400/10 text-purple-400",
  };

  return (
    <div className="space-y-6">
      {Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {!!summary.total_opportunities && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{String(summary.total_opportunities)}</p>
                <p className="text-xs text-muted-foreground">Opportunities</p>
              </CardContent>
            </Card>
          )}
          {!!summary.total_estimated_potential && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{String(summary.total_estimated_potential)}</p>
                <p className="text-xs text-muted-foreground">Total Potential</p>
              </CardContent>
            </Card>
          )}
          {!!summary.by_confidence && typeof summary.by_confidence === "object" && (
            <Card className="col-span-2">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">By Confidence</p>
                <div className="flex items-center gap-4">
                  {Object.entries(summary.by_confidence as Record<string, number>).map(([level, count]) => (
                    <div key={level} className="text-center">
                      <p className={`text-lg font-bold ${confidenceColors[level]?.split(" ")[0] || ""}`}>{count}</p>
                      <p className="text-xs text-muted-foreground capitalize">{level}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {opportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Identified Opportunities
              <HelpPopover title="Opportunities">
                Business opportunities identified by the Account Intelligence Agent
                through analysis of strategic initiatives, organizational structure,
                and public disclosures.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map((opp, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{String(opp.name)}</span>
                    <div className="flex items-center gap-1.5">
                      {!!opp.type && (
                        <Badge className={`text-xs ${typeColors[String(opp.type)] || ""}`}>
                          {String(opp.type).replace(/_/g, " ")}
                        </Badge>
                      )}
                      {!!opp.confidence && (
                        <Badge variant="outline" className={`text-xs ${confidenceColors[String(opp.confidence)] || ""}`}>
                          {String(opp.confidence)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {!!opp.business_line && <span>{String(opp.business_line)}</span>}
                    {!!opp.department && <span>· {String(opp.department)}</span>}
                    {!!opp.estimated_potential && (
                      <span className="text-green-400 font-medium">{String(opp.estimated_potential)}</span>
                    )}
                    {!!opp.status && <Badge variant="outline" className="text-xs">{String(opp.status)}</Badge>}
                  </div>
                  {!!opp.vendor_capability && (
                    <p className="text-xs text-muted-foreground">{String(opp.vendor_capability)}</p>
                  )}
                  {!!opp.engagement_blocker && (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-400/80">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{String(opp.engagement_blocker)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
