"use client";

import { useParams } from "next/navigation";
import { PresentationShell } from "@/components/presentation/presentation-shell";
import { buildNodeSlides } from "@/components/presentation/node-slides";
import { NODE_SAMPLE_DATA } from "@/components/presentation/node-data";

export default function NodePresentationPage() {
  const params = useParams();
  const nodeId = params.nodeId as string;

  const data = NODE_SAMPLE_DATA[nodeId];

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Node not found</p>
          <p className="text-muted-foreground">{nodeId}</p>
        </div>
      </div>
    );
  }

  const slides = buildNodeSlides(data);

  return (
    <PresentationShell
      slides={slides}
      backLabel={data.realm_name}
      backHref={`/present/realm/${data.realm_id}`}
    />
  );
}
