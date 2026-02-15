import type { Metadata } from "next";

export const metadata: Metadata = { title: "Knowledge Vault" };

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
