"use client";

import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildBlueprintsSlides } from "@/components/presentation/blueprints-slides";
import { BLUEPRINTS_SAMPLE_DATA } from "@/components/presentation/blueprints-data";

export default function BlueprintsPresentationPage() {
  const slides = buildBlueprintsSlides(BLUEPRINTS_SAMPLE_DATA);
  return <PresentationShell slides={slides} />;
}
