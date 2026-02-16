"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, TrendingUp, TrendingDown, Minus, Zap, Shield } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpPopover } from "@/components/help-popover";
import { EmptyState } from "./shared";

const strengthColors: Record<string, string> = {
  strong: "text-green-400 border-green-400/30",
  moderate: "text-yellow-400 border-yellow-400/30",
  emerging: "text-blue-400 border-blue-400/30",
  weak: "text-muted-foreground",
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "growing") return <TrendingUp className="h-3.5 w-3.5 text-green-400" />;
  if (trend === "declining") return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export function VendorsTab({ realmId }: { realmId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["vendorLandscape", realmId],
    queryFn: () => api.getVendorLandscape(realmId),
    enabled: !!realmId,
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!data || Object.keys(data).length === 0) return <EmptyState message="No vendor landscape data available." />;

  const categories = (data.vendors_by_category || []) as Record<string, unknown>[];
  const displacements = (data.displacement_opportunities || []) as Record<string, unknown>[];
  const ourPosition = (data.our_position || []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      {categories.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Package className="h-4 w-4" />
            Vendors by Category
            <HelpPopover title="Vendor landscape">
              Technology vendors detected by the Technology Scout from job postings,
              tech blogs, and vendor announcements. Adoption strength indicates how
              deeply embedded each vendor is.
            </HelpPopover>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => {
              const vendors = (cat.vendors || []) as Record<string, unknown>[];
              return (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{String(cat.category)}</span>
                      <div className="flex items-center gap-1.5">
                        {!!cat.dominant_vendor && (
                          <Badge variant="secondary" className="text-xs">{String(cat.dominant_vendor)}</Badge>
                        )}
                      </div>
                    </CardTitle>
                    {!!cat.consolidation_trend && (
                      <p className="text-xs text-muted-foreground">Trend: {String(cat.consolidation_trend)}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {vendors.map((v, j) => (
                        <div key={j} className="flex items-center justify-between p-2 rounded bg-muted/30">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{String(v.name)}</span>
                            {!!v.adoption_strength && (
                              <Badge variant="outline" className={`text-xs ${strengthColors[String(v.adoption_strength)] || ""}`}>
                                {String(v.adoption_strength)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!!v.evidence_count && (
                              <span className="text-xs text-muted-foreground">{String(v.evidence_count)} signals</span>
                            )}
                            {!!v.trend && <TrendIcon trend={String(v.trend)} />}
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

      {displacements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Displacement Opportunities
              <HelpPopover title="Displacement opportunities">
                Vendors showing declining adoption signals, creating potential
                displacement opportunities for our products.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displacements.map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <span className="text-red-400 line-through">{String(d.incumbent)}</span>
                        <span className="text-muted-foreground mx-2">&rarr;</span>
                        <span className="text-green-400 font-medium">{String(d.our_product)}</span>
                      </span>
                    </div>
                    {!!d.confidence && (
                      <Badge variant="outline" className="text-xs">{String(d.confidence)} confidence</Badge>
                    )}
                  </div>
                  {!!d.declining_signal && (
                    <p className="text-xs text-muted-foreground">{String(d.declining_signal)}</p>
                  )}
                  {!!d.evidence && (
                    <p className="text-xs text-muted-foreground">{String(d.evidence)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {ourPosition.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Our Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4">Our Product</th>
                    <th className="pb-2 pr-4">Competitor</th>
                    <th className="pb-2">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {ourPosition.map((pos, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4">{String(pos.category)}</td>
                      <td className="py-2 pr-4 font-medium text-green-400">{String(pos.our_product)}</td>
                      <td className="py-2 pr-4">{pos.detected_competitor ? String(pos.detected_competitor) : "None"}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-xs">
                          {String(pos.relative_strength || "").replace(/_/g, " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
