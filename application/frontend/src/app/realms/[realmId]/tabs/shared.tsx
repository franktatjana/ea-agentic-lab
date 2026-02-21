"use client";

import * as React from "react";
import { DataSourceTrigger } from "@/components/data-source-panel";

export function ProfileField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: unknown;
  icon?: React.ElementType;
}) {
  if (value == null || value === "") return null;

  const renderValue = () => {
    if (typeof value === "object" && !Array.isArray(value)) {
      return (
        <div className="space-y-0.5">
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <p key={k} className="text-sm">
              <span className="text-muted-foreground">{k.replace(/_/g, " ")}:</span>{" "}
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </p>
          ))}
        </div>
      );
    }
    if (Array.isArray(value)) {
      return <p className="text-sm">{value.join(", ")}</p>;
    }
    return <p className="text-sm">{String(value)}</p>;
  };

  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
}

export function TabHeader({ pageSection }: { pageSection: string }) {
  return (
    <div className="flex items-center justify-end mb-2">
      <DataSourceTrigger pageSection={pageSection} />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
