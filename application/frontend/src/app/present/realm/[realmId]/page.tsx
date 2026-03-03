"use client";

import { useParams } from "next/navigation";
import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildRealmSlides } from "@/components/presentation/realm-slides";
import { REALM_SAMPLE_DATA } from "@/components/presentation/realm-data";

export default function RealmPresentationPage() {
  const params = useParams();
  const realmId = params.realmId as string;

  const data = REALM_SAMPLE_DATA[realmId];

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Realm not found</p>
          <p className="text-muted-foreground">{realmId}</p>
        </div>
      </div>
    );
  }

  const slides = buildRealmSlides(data);

  return <PresentationShell slides={slides} backLabel="QBR" backHref="/present/qbr?slide=portfolio" />;
}
