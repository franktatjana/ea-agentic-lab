import type { Metadata } from "next";

export const metadata: Metadata = { title: "Playbooks" };

export default function PlaybooksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
