"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, DollarSign, TrendingUp, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpPopover } from "@/components/help-popover";
import { ProfileField, EmptyState, TabHeader } from "./shared";

export function AccountTab({ realmId }: { realmId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["companyIntelligence", realmId],
    queryFn: () => api.getCompanyIntelligence(realmId),
    enabled: !!realmId,
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!data || Object.keys(data).length === 0) return <EmptyState message="No account intelligence available." />;

  const overview = (data.company_overview || {}) as Record<string, unknown>;
  const financials = (data.financial_summary || {}) as Record<string, unknown>;
  const businessLines = (data.business_lines || []) as Record<string, unknown>[];
  const description = data.business_description as string | undefined;

  return (
    <div className="space-y-6">
      <TabHeader pageSection="account" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Company Overview
              <HelpPopover title="Company overview">
                Public company information gathered by the Account Intelligence
                Agent from annual reports, investor presentations, and company
                websites.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ProfileField label="Legal Name" value={overview.legal_name} icon={Building2} />
            <ProfileField label="Founded" value={overview.founded} />
            <ProfileField label="Headquarters" value={overview.headquarters} />
            <ProfileField label="Employees" value={overview.employees ? Number(overview.employees).toLocaleString() : undefined} />
            <ProfileField label="Revenue" value={overview.revenue} icon={DollarSign} />
            <ProfileField label="Stock Symbol" value={overview.stock_symbol} />
            <ProfileField label="Public/Private" value={overview.public_private} />
            {!!description && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">Business Description</p>
                <p className="text-sm mt-1">{String(description)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {Object.keys(financials).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Financial Summary
                <HelpPopover title="Financial summary">
                  Key financial metrics from public filings. IT budget estimates
                  help size the total addressable opportunity.
                </HelpPopover>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ProfileField label="Total Revenue" value={financials.total_revenue} icon={DollarSign} />
              <ProfileField label="Revenue Growth" value={financials.revenue_growth} icon={TrendingUp} />
              <ProfileField label="Operating Margin" value={financials.operating_margin} />
              <ProfileField label="R&D Spending" value={financials.r_and_d_spending} />
              <ProfileField label="IT Budget Estimate" value={financials.it_budget_estimate} />
            </CardContent>
          </Card>
        )}
      </div>

      {businessLines.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-muted-foreground">Business Lines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessLines.map((bl, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{String(bl.name)}</span>
                    {!!bl.revenue_contribution && (
                      <Badge variant="secondary" className="text-xs">{String(bl.revenue_contribution)}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {!!bl.revenue && <p className="text-xs text-muted-foreground">Revenue: {String(bl.revenue)}</p>}
                  {!!bl.growth_rate && <p className="text-xs text-muted-foreground">Growth: {String(bl.growth_rate)}</p>}
                  {!!bl.description && <p>{String(bl.description)}</p>}
                  {Array.isArray(bl.focus_areas) && bl.focus_areas.length > 0 && (
                    <ul className="space-y-1">
                      {(bl.focus_areas as string[]).map((area, j) => (
                        <li key={j} className="text-xs text-muted-foreground">· {area}</li>
                      ))}
                    </ul>
                  )}
                  {Array.isArray(bl.geographic_markets) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(bl.geographic_markets as string[]).map((m, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />{m}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
