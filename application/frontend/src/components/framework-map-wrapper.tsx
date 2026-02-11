"use client";

import dynamic from "next/dynamic";

const FrameworkMap = dynamic(
  () => import("@/components/framework-map").then((m) => m.FrameworkMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-xl border border-border/50 bg-muted/10 animate-pulse" />
    ),
  },
);

export function FrameworkMapSection() {
  return <FrameworkMap />;
}
