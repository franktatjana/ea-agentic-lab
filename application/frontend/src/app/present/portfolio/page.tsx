"use client";

import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildPortfolioSlides } from "@/components/presentation/portfolio-slides";
import { PORTFOLIO_SAMPLE_DATA } from "@/components/presentation/portfolio-data";

export default function PortfolioPresentationPage() {
  const slides = buildPortfolioSlides(PORTFOLIO_SAMPLE_DATA);
  return <PresentationShell slides={slides} />;
}
