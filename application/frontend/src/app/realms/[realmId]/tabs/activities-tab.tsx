"use client";

import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpPopover } from "@/components/help-popover";
import { ProfileField, EmptyState, TabHeader } from "./shared";

export function ActivitiesTab({ profile }: { profile: Record<string, unknown> }) {
  const governance = (profile.governance || {}) as Record<string, unknown>;
  const cadence = (governance.operating_cadence || {}) as Record<string, unknown>;
  const actionPlan = (profile.action_plan || {}) as Record<string, unknown>;
  const priorities = (actionPlan.current_priorities || []) as Record<string, unknown>[];
  const next30 = (actionPlan.next_30_days || []) as Record<string, unknown>[];
  const next90 = (actionPlan.next_90_days || []) as Record<string, unknown>[];

  const hasData = Object.keys(cadence).length > 0 || priorities.length > 0 || next30.length > 0 || next90.length > 0;
  if (!hasData) return <EmptyState message="No activity data available." />;

  const statusColors: Record<string, string> = {
    IN_PROGRESS: "text-blue-400 border-blue-400/30",
    COMPLETED: "text-green-400 border-green-400/30",
    BLOCKED: "text-red-400 border-red-400/30",
    NOT_STARTED: "text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <TabHeader pageSection="activities" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(cadence).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Operating Cadence
                <HelpPopover title="Operating cadence">
                  Scheduled engagement touchpoints, including internal syncs, customer
                  executive business reviews, and governance meetings.
                </HelpPopover>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ProfileField label="Internal Sync" value={cadence.internal_sync} />
              <ProfileField label="Customer EBR" value={cadence.customer_ebr} />
              <ProfileField label="Executive Touchpoint" value={cadence.executive_touchpoint} />
              {!!governance.next_qbr && <ProfileField label="Next QBR" value={governance.next_qbr} icon={Calendar} />}
              {!!governance.next_renewal_review && <ProfileField label="Next Renewal Review" value={governance.next_renewal_review} icon={Calendar} />}
            </CardContent>
          </Card>
        )}

        {priorities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Current Priorities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorities.map((p, i) => (
                  <div key={i} className="p-2.5 rounded bg-muted/30 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{String(p.priority)}</span>
                      {!!p.status && (
                        <Badge variant="outline" className={`text-xs ${statusColors[String(p.status)] || ""}`}>
                          {String(p.status).replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {!!p.owner && <span>{String(p.owner)}</span>}
                      {!!p.due_date && <span>Due: {String(p.due_date)}</span>}
                    </div>
                    {!!p.success_criteria && (
                      <p className="text-xs text-muted-foreground">{String(p.success_criteria)}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {next30.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Next 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {next30.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded bg-muted/30 text-sm">
                  <span>{String(a.action)}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 ml-4">
                    {!!a.owner && <span>{String(a.owner)}</span>}
                    {!!a.due && <span>{String(a.due)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {next90.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Next 90 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {next90.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded bg-muted/30 text-sm">
                  <span>{String(a.action)}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 ml-4">
                    {!!a.owner && <span>{String(a.owner)}</span>}
                    {!!a.due && <span>{String(a.due)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
