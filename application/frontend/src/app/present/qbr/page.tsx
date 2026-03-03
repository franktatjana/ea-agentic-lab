"use client";

import { useState } from "react";
import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildQbrSlides } from "@/components/presentation/qbr-slides";
import { buildRealmSlides } from "@/components/presentation/realm-slides";
import { QBR_SAMPLE_DATA } from "@/components/presentation/qbr-data";
import { REALM_SAMPLE_DATA } from "@/components/presentation/realm-data";

export default function QbrPresentationPage() {
  const [activeRealm, setActiveRealm] = useState<string | null>(null);

  if (activeRealm) {
    const realmData = REALM_SAMPLE_DATA[activeRealm];
    if (realmData) {
      const realmSlides = buildRealmSlides(realmData);
      return (
        <PresentationShell
          key={`realm-${activeRealm}`}
          slides={realmSlides}
          backLabel="QBR"
          onExit={() => setActiveRealm(null)}
        />
      );
    }
  }

  const slides = buildQbrSlides(QBR_SAMPLE_DATA, (realmId) => setActiveRealm(realmId));

  return <PresentationShell key="qbr" slides={slides} />;
}
