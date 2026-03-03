"use client";

import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildPitchSlides } from "@/components/presentation/pitch-slides";
import { PITCH_SAMPLE_DATA } from "@/components/presentation/pitch-data";

export default function PitchPresentationPage() {
  const slides = buildPitchSlides(PITCH_SAMPLE_DATA);
  return <PresentationShell slides={slides} />;
}
