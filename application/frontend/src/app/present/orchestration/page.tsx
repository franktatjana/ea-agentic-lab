"use client";

import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildOrchestrationSlides } from "@/components/presentation/orchestration-slides";
import { ORCHESTRATION_SAMPLE_DATA } from "@/components/presentation/orchestration-data";

export default function OrchestrationPresentationPage() {
  const slides = buildOrchestrationSlides(ORCHESTRATION_SAMPLE_DATA);
  return <PresentationShell slides={slides} />;
}
