"use client";

import {
  Briefcase,
  Users,
  DollarSign,
  MapPin,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpPopover } from "@/components/help-popover";
import { ProfileField } from "./shared";

export function ProfileTab({ profile }: { profile: Record<string, unknown> }) {
  const company = (profile.company_info || profile.company_profile || profile) as Record<string, unknown>;
  const overview = (company.company_overview || {}) as Record<string, unknown>;
  const classification = (profile.classification || {}) as Record<string, unknown>;
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
          <ProfileField label="Employees" value={overview.employees || company.employees || profile.employees} icon={Users} />
          <ProfileField label="Revenue" value={overview.annual_revenue || overview.revenue || company.revenue || profile.revenue} icon={DollarSign} />
          <ProfileField label="Headquarters" value={overview.headquarters || company.headquarters || profile.headquarters} icon={MapPin} />
          <ProfileField label="Region" value={company.region || classification.region || profile.region} icon={Globe} />
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
