"use client";

import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildKnowledgeSlides } from "@/components/presentation/knowledge-slides";
import { KNOWLEDGE_SAMPLE_DATA } from "@/components/presentation/knowledge-data";

export default function KnowledgePresentationPage() {
  const slides = buildKnowledgeSlides(KNOWLEDGE_SAMPLE_DATA);
  return <PresentationShell slides={slides} />;
}
