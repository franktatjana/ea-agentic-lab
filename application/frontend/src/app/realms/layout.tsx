import type { Metadata } from "next";

export const metadata: Metadata = { title: "Realms" };

export default function RealmsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
