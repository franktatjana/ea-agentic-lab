"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Shield, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpPopover } from "@/components/help-popover";
import { ProfileField, EmptyState, TabHeader } from "./shared";

export function IndustryTab({ realmId }: { realmId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["industryIntelligence", realmId],
    queryFn: () => api.getIndustryIntelligence(realmId),
    enabled: !!realmId,
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  const industryProfile = (data?.industry_profile || {}) as Record<string, unknown>;
  const trendAnalysis = (data?.trend_analysis || {}) as Record<string, unknown>;
  const regulatory = (data?.regulatory_landscape || {}) as Record<string, unknown>;

  const overview = (industryProfile.industry_overview || {}) as Record<string, unknown>;
  const segments = (industryProfile.segments || []) as Record<string, unknown>[];
  const dynamics = (industryProfile.competitive_dynamics || {}) as Record<string, unknown>;
  const benchmarks = (industryProfile.benchmarks || []) as Record<string, unknown>[];
  const trends = (trendAnalysis.trends || []) as Record<string, unknown>[];
  const activeRegs = (regulatory.active_regulations || []) as Record<string, unknown>[];
  const upcomingRegs = (regulatory.upcoming_regulations || []) as Record<string, unknown>[];

  const hasData = Object.keys(overview).length > 0 || segments.length > 0 || trends.length > 0;
  if (!hasData) return <EmptyState message="No industry intelligence available." />;

  const maturityColors: Record<string, string> = {
    emerging: "text-blue-400",
    accelerating: "text-green-400",
    mature: "text-yellow-400",
    declining: "text-red-400",
  };

  return (
    <div className="space-y-6">
      <TabHeader pageSection="industry" />
      {Object.keys(overview).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Industry Overview
              <HelpPopover title="Industry overview">
                Sector-level analysis from the Industry Intelligence Agent,
                including market size, growth rates, and geographic distribution.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ProfileField label="Industry" value={overview.name} icon={BarChart3} />
            <ProfileField label="Market Size" value={overview.market_size} />
            <ProfileField label="Growth Rate" value={overview.growth_rate} icon={TrendingUp} />
            {!!overview.maturity && (
              <div className="flex items-start gap-3 py-2">
                <div>
                  <p className="text-xs text-muted-foreground">Maturity</p>
                  <Badge variant="outline" className="text-xs mt-0.5">{String(overview.maturity).replace(/_/g, " ")}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {segments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Market Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Segment</th>
                    <th className="pb-2 pr-4">Market Share</th>
                    <th className="pb-2 pr-4">Growth</th>
                    <th className="pb-2">Key Players</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((seg, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 font-medium">{String(seg.name)}</td>
                      <td className="py-2 pr-4">{String(seg.market_share || "")}</td>
                      <td className="py-2 pr-4">{String(seg.growth || "")}</td>
                      <td className="py-2">
                        {Array.isArray(seg.key_players)
                          ? (seg.key_players as string[]).join(", ")
                          : String(seg.key_players || "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(dynamics).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Competitive Dynamics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.isArray(dynamics.key_dynamics) && (
              <ul className="space-y-1.5">
                {(dynamics.key_dynamics as string[]).map((d, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">·</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
              {["concentration", "barriers_to_entry", "buyer_power", "supplier_power", "substitution_threat"].map((key) =>
                dynamics[key] ? (
                  <div key={key} className="text-xs">
                    <span className="text-muted-foreground">{key.replace(/_/g, " ")}:</span>{" "}
                    <span className="capitalize">{String(dynamics[key]).replace(/_/g, " ")}</span>
                  </div>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {benchmarks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Industry Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Metric</th>
                    <th className="pb-2 pr-4">Industry Average</th>
                    <th className="pb-2">Top Quartile</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.map((b, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 font-medium">{String(b.metric)}</td>
                      <td className="py-2 pr-4">{String(b.industry_average || "")}</td>
                      <td className="py-2">{String(b.top_quartile || "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {trends.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Industry Trends
              <HelpPopover title="Industry trends">
                Tracked technology and regulatory trends with maturity levels and
                vendor relevance scoring. Used to align sales messaging with
                industry momentum.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.map((t, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{String(t.name)}</span>
                    <div className="flex items-center gap-1.5">
                      {!!t.category && <Badge variant="outline" className="text-xs">{String(t.category)}</Badge>}
                      {!!t.maturity && (
                        <Badge variant="secondary" className={`text-xs ${maturityColors[String(t.maturity)] || ""}`}>
                          {String(t.maturity)}
                        </Badge>
                      )}
                      {!!t.direction && (
                        <TrendingUp className={`h-3.5 w-3.5 ${t.direction === "growing" ? "text-green-400" : t.direction === "declining" ? "text-red-400 rotate-180" : "text-muted-foreground"}`} />
                      )}
                    </div>
                  </div>
                  {!!t.description && <p className="text-sm text-muted-foreground">{String(t.description)}</p>}
                  {!!t.vendor_relevance && (
                    <p className="text-xs">
                      <span className="text-muted-foreground">Vendor relevance:</span>{" "}
                      <span className={String(t.vendor_relevance).includes("high") ? "text-green-400" : ""}>{String(t.vendor_relevance).replace(/_/g, " ")}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(activeRegs.length > 0 || upcomingRegs.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Regulatory Landscape
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRegs.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Active Regulations</p>
                <div className="space-y-2">
                  {activeRegs.map((r, i) => (
                    <div key={i} className="p-2.5 rounded bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{String(r.name)}</span>
                        <Badge variant="outline" className="text-xs">{String(r.jurisdiction || "")}</Badge>
                      </div>
                      {!!r.impact && <p className="text-xs text-muted-foreground">{String(r.impact)}</p>}
                      {!!r.vendor_opportunity && <p className="text-xs text-green-400/80">{String(r.vendor_opportunity)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {upcomingRegs.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Upcoming Regulations</p>
                <div className="space-y-2">
                  {upcomingRegs.map((r, i) => (
                    <div key={i} className="p-2.5 rounded bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{String(r.name)}</span>
                        <span className="text-xs text-muted-foreground">{String(r.expected_date || "")}</span>
                      </div>
                      {!!r.impact && <p className="text-xs text-muted-foreground">{String(r.impact)}</p>}
                      {!!r.vendor_opportunity && <p className="text-xs text-green-400/80">{String(r.vendor_opportunity)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
