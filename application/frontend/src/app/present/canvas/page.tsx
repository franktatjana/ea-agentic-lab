"use client";

import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildCanvasSlides } from "@/components/presentation/canvas-slides";
import { CANVAS_SAMPLE_DATA } from "@/components/presentation/canvas-pres-data";

export default function CanvasPresentationPage() {
  const slides = buildCanvasSlides(CANVAS_SAMPLE_DATA);
  return <PresentationShell slides={slides} />;
}
