"use client";

import { useQuery } from "@tanstack/react-query";
import { Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpPopover } from "@/components/help-popover";
import { EmptyState, TabHeader } from "./shared";

function InitiativeCard({ item, source }: { item: Record<string, unknown>; source?: string }) {
  const statusColors: Record<string, string> = {
    in_progress: "text-blue-400 border-blue-400/30",
    active: "text-blue-400 border-blue-400/30",
    planning: "text-yellow-400 border-yellow-400/30",
    completed: "text-green-400 border-green-400/30",
  };
  const relevanceColors: Record<string, string> = {
    HIGH: "text-green-400",
    MEDIUM: "text-yellow-400",
    LOW: "text-muted-foreground",
  };

  const name = String(item.initiative || item.name || "");
  const status = String(item.status || "");
  const timeframe = String(item.timeframe || "");
  const relevance = String(item.relevance_to_vendor || "");
  const description = item.description as string | undefined;
  const latestUpdate = item.latest_update as string | undefined;

  return (
    <div className="p-3 rounded-lg bg-muted/30 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{name}</span>
        <div className="flex items-center gap-1.5">
          {!!timeframe && <Badge variant="outline" className="text-xs">{timeframe}</Badge>}
          {!!status && (
            <Badge variant="outline" className={`text-xs ${statusColors[status] || ""}`}>
              {status.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </div>
      {!!description && <p className="text-sm text-muted-foreground">{description}</p>}
      {!!relevance && (
        <p className="text-xs">
          <span className="text-muted-foreground">Vendor relevance:</span>{" "}
          <span className={relevanceColors[relevance] || ""}>{relevance}</span>
        </p>
      )}
      {!!latestUpdate && (
        <p className="text-xs text-muted-foreground">Latest: {latestUpdate}</p>
      )}
      {!!source && <p className="text-xs text-muted-foreground/60">{source}</p>}
    </div>
  );
}

export function StrategyTab({ realmId, profile }: { realmId: string; profile: Record<string, unknown> }) {
  const { data: intelligence, isLoading } = useQuery({
    queryKey: ["companyIntelligence", realmId],
    queryFn: () => api.getCompanyIntelligence(realmId),
    enabled: !!realmId,
  });

  const companyInitiatives = (intelligence?.strategic_initiatives || []) as Record<string, unknown>[];

  const companyProfile = (profile.company_profile || profile) as Record<string, unknown>;
  const profileInitiatives = (companyProfile.strategic_initiatives || profile.strategic_initiatives || []) as Record<string, unknown>[];

  const hasData = companyInitiatives.length > 0 || profileInitiatives.length > 0;

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!hasData) return <EmptyState message="No strategy data available." />;

  return (
    <div className="space-y-6">
      <TabHeader pageSection="strategy" />
      {companyInitiatives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Company Strategic Initiatives
              <HelpPopover title="Company initiatives">
                Strategic programs identified from public sources by the Account
                Intelligence Agent. Relevance scores indicate how closely each
                initiative aligns with your product capabilities.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companyInitiatives.map((item, i) => (
                <InitiativeCard key={i} item={item} source="Source: public intelligence" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profileInitiatives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Our Engagement Strategy
              <HelpPopover title="Engagement strategy">
                Vendor-side strategic initiatives mapped to this account, maintained
                by the AE Agent. These track how we plan to engage with the
                customer&apos;s strategic programs.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profileInitiatives.map((item, i) => (
                <InitiativeCard key={i} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
