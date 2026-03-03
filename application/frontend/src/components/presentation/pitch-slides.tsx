"use client";

import { Sparkles, AlertTriangle, ArrowRight, Github, Linkedin, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PitchPresentationData } from "./pitch-data";
import type { Slide } from "./presentation-shell";

function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

const pillarColors: Record<string, { border: string; bg: string; text: string }> = {
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-400" },
  purple: { border: "border-purple-500/30", bg: "bg-purple-500/5", text: "text-purple-400" },
  teal: { border: "border-teal-500/30", bg: "bg-teal-500/5", text: "text-teal-400" },
};

export function buildPitchSlides(data: PitchPresentationData): Slide[] {
  return [
    // 1. Cover
    {
      id: "cover",
      title: "Cover",
      content: (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
              {data.subtitle}
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4">{data.title}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-6">{data.tagline}</p>
          <p className="text-sm text-muted-foreground/60 max-w-2xl mb-8">{data.concept_framing}</p>
          <a
            href={data.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            by {data.author}
          </a>
        </div>
      ),
    },

    // 2. The Problem
    {
      id: "problem",
      title: "The Problem",
      content: (
        <div>
          <SlideHeader
            title="The Problem"
            subtitle="Engagements fail because they lack structure, not talent"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.problems.map((p, i) => (
              <div key={i} className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">{p.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 3. Three Pillars
    {
      id: "pillars",
      title: "Three Pillars",
      content: (
        <div>
          <SlideHeader
            title="Three Conceptual Pillars"
            subtitle="People amplified by agents, customers understood through blueprints, knowledge preserved as artifacts"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.pillars.map((p, i) => {
              const colors = pillarColors[p.color] || pillarColors.amber;
              return (
                <div key={i} className={cn("border rounded-xl p-6", colors.border, colors.bg)}>
                  <p className={cn("text-lg font-bold mb-3", colors.text)}>{p.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },

    // 4. How It Works - Part 1
    {
      id: "lifecycle-1",
      title: "How It Works (1/2)",
      content: (
        <div>
          <SlideHeader
            title="How It Works"
            subtitle="From recognition to execution"
          />
          <div className="space-y-4">
            {data.lifecycle.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-start gap-4 border rounded-xl p-5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-primary">{s.step}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">{s.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                </div>
                {i < 2 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 5. How It Works - Part 2
    {
      id: "lifecycle-2",
      title: "How It Works (2/2)",
      content: (
        <div>
          <SlideHeader
            title="How It Works"
            subtitle="From artifacts to institutional memory"
          />
          <div className="space-y-4">
            {data.lifecycle.slice(3).map((s, i) => (
              <div key={i} className="flex items-start gap-4 border rounded-xl p-5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-primary">{s.step}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">{s.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                </div>
                {i < 2 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 6. At a Glance
    {
      id: "stats",
      title: "At a Glance",
      content: (
        <div>
          <SlideHeader
            title="At a Glance"
            subtitle="The building blocks of the platform"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {data.stats.map((s, i) => (
              <div key={i} className="border rounded-xl p-6 text-center">
                <p className={cn("text-4xl font-bold", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase mt-2">{s.label}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 7. Who This Is For
    {
      id: "personas",
      title: "Who This Is For",
      content: (
        <div>
          <SlideHeader
            title="Who This Is For"
            subtitle="Every role in the enterprise account lifecycle gets targeted value"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.personas.map((p, i) => (
              <div key={i} className="border rounded-xl p-5">
                <p className="font-semibold mb-2">{p.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.value}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 8. What Makes This Different
    {
      id: "differentiators",
      title: "What Makes This Different",
      content: (
        <div>
          <SlideHeader
            title="What Makes This Different"
            subtitle="An active governance system, not another CRM overlay"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.differentiators.map((d, i) => (
              <div key={i} className="border rounded-xl p-6">
                <p className="font-semibold mb-2">{d.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 9. About Me
    {
      id: "about",
      title: "About",
      content: (
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold mb-4">{data.about_me.name}</h2>
          <p className="text-lg text-muted-foreground mb-6">{data.about_me.role}</p>
          <p className="text-sm text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            {data.about_me.description}
          </p>
          <div className="flex items-center gap-6">
            <a
              href={data.about_me.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={data.about_me.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4 text-blue-400" />
              LinkedIn
            </a>
          </div>
        </div>
      ),
    },

    // 10. What's Next
    {
      id: "what-next",
      title: "What's Next",
      content: (
        <div>
          <SlideHeader title="What's Next" subtitle="Building toward production" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {data.what_next.map((item, i) => (
              <div key={i} className="border rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Rocket className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center pt-4">
            <p className="text-xl font-semibold text-muted-foreground mb-4">
              Humans decide. The system enforces discipline.
            </p>
            <a
              href={data.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              {data.author}
            </a>
          </div>
        </div>
      ),
    },
  ];
}
