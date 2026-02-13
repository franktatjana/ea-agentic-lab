import { Separator } from "@/components/ui/separator";

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

          {/* TODO: Add your bio, background, and links here */}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">About This Project</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
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
      </section>

      {/* TODO: Add sections as needed, e.g.:
        - Your background and experience
        - What this project demonstrates
        - Contact / social links (GitHub, LinkedIn, etc.)
        - Tech stack highlights
      */}
    </div>
  );
}
