import type { Metadata } from "next";
import Link from "next/link";
import { Github, Linkedin, Scale, Info, FlaskConical } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "About" };

const LINKS = [
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/franktatjana",
    color: "text-foreground",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/tatjana-frank/",
    color: "text-blue-400",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <section className="pt-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">About</h1>

        <div className="space-y-4 text-muted-foreground">
          <p>
            EA Agentic Lab is a concept showcase by{" "}
            <span className="text-foreground font-medium">Tatjana Frank</span>.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-2">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <link.icon className={`h-4 w-4 ${link.color}`} />
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">About This Project</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <FlaskConical className="h-4 w-4 mt-0.5 shrink-0 text-purple-400" />
            <div className="space-y-3">
              <p>
                This is a working demo of a concept framework for agentic enterprise
                governance. It combines multi-agent orchestration with structured
                playbook execution to enforce governance discipline without replacing
                human judgment.
              </p>
              <p>
                All companies, scenarios, and data are fictional. Names, characters,
                and organizations are hypothetical. Any resemblance to actual
                persons, companies, or events is purely coincidental.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Software Vendors</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-400" />
            <div className="space-y-3">
              <p>
                This showcase uses fictional vendor names (Titanmetrics,
                Vizara, DataForge, ShieldOne, and others) alongside real
                infrastructure tools (AWS, Azure, GCP, Kubernetes, Terraform,
                etc.) to demonstrate how the framework handles competitive
                intelligence, technology signal tracking, and evaluation
                checklists in a realistic enterprise setting.
              </p>
              <p>
                No vendor endorsement, partnership, or affiliation is implied.
                All trademarks belong to their respective owners. Generic
                placeholders (LegacySIEM, ObservabilityVendorA, etc.) are used
                where specific vendor identity is irrelevant to the concept.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">License</h2>
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Scale className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            This project is licensed under{" "}
            <Link
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              CC BY-NC-SA 4.0
            </Link>
            . You may share and adapt the material with attribution, but not for commercial purposes.
          </p>
        </div>
      </section>
    </div>
  );
}
