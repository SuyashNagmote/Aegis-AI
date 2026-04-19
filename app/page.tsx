import Link from "next/link";
import { ArrowRight, Blocks, BrainCircuit, ShieldCheck, Zap } from "lucide-react";

import { HeroTelemetry } from "@/components/hero-telemetry";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";

const pillars = [
  {
    icon: BrainCircuit,
    title: "Understands user intent",
    text: "Compares declared intent with decoded calldata so a fake claim flow can be caught before signing."
  },
  {
    icon: ShieldCheck,
    title: "Detects modern wallet abuse",
    text: "Flags unlimited approvals, permit flows, suspicious destinations, novelty spikes, and multicall risk."
  },
  {
    icon: Zap,
    title: "Explains clearly",
    text: "Turns raw transaction structure into plain-language warnings, confidence, reasons, and policy outcomes."
  },
  {
    icon: Blocks,
    title: "Stays honest",
    text: "Presents simulation and integrity records clearly without pretending they are full EVM execution or real ZK."
  }
];

export default function HomePage() {
  return (
    <main className="pb-24">
      <SiteHeader />

      <section className="container-shell pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-7">
            <div className="flex flex-wrap gap-3">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                Intent-aware wallet security platform
              </Badge>
              <Badge className="border-white/10 bg-white/[0.06] text-white/70">
                Production-style MVP
              </Badge>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-white md:text-7xl">
                Stop wallet drains by checking
                <span className="bg-gradient-to-r from-white via-primary to-[#7ad8ff] bg-clip-text text-transparent">
                  {" "}
                  intent, context, and policy
                </span>
                {" "}
                before signing.
              </h1>
              <p className="max-w-3xl text-xl leading-8 text-white/68">
                Sentinel AI decodes raw wallet actions, compares them against what the user meant to
                do, checks live context, and converts all of that into a clear signing decision with
                honest explanations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
                )}
              >
                Launch live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#architecture"
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-white/10"
                )}
              >
                View architecture
              </Link>
            </div>

            <div className="grid gap-4 pt-3 sm:grid-cols-3">
              {[
                ["Intent-first", "Mismatch detection catches phishing-style flows"],
                ["Policy-backed", "AI explains, but deterministic rules decide"],
                ["Operator-ready", "Confidence, reasons, novelty, and replay-aware records"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                  <div className="text-2xl font-semibold text-white">{value}</div>
                  <div className="mt-1 text-sm text-white/55">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroTelemetry />
        </div>
      </section>

      <section className="container-shell mt-12">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["15+", "Risk signals surfaced per analysis path"],
            ["Intent", "User-declared goal compared with decoded action"],
            ["Permit + Multicall", "Expanded coverage beyond basic transfers"],
            ["Honest Simulation", "Advisory only, never marketed as full execution"]
          ].map(([title, text]) => (
            <div key={title} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
              <div className="text-lg font-semibold text-white">{title}</div>
              <div className="mt-2 text-sm leading-6 text-white/55">{text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell mt-24">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <pillar.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{pillar.title}</CardTitle>
                <CardDescription>{pillar.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="architecture" className="container-shell mt-24">
        <Card className="overflow-hidden">
          <CardHeader>
            <Badge className="w-fit border-white/10 bg-white/5 text-white/75">Architecture</Badge>
            <CardTitle className="text-3xl">Client to Gateway to Analysis Pipeline to Signing Guard</CardTitle>
            <CardDescription>
              Built as a modular full-stack product demo with honest security boundaries and room to
              harden further.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {[
              "Next.js frontend with polished telemetry, wallet authentication, intent capture, and interception controls.",
              "REST APIs for health, authentication, analysis, feedback, and guarded signing with policy-first outputs.",
              "Risk engine, RPC context, novelty signals, integrity records, cache, and Prisma-backed persistence."
            ].map((line) => (
              <div key={line} className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/72">
                {line}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="container-shell mt-24">
        <Card>
          <CardHeader>
            <Badge className="w-fit border-warning/20 bg-warning/10 text-warning">Security Positioning</Badge>
            <CardTitle className="text-3xl">What Sentinel does, and what it does not pretend to do</CardTitle>
            <CardDescription>
              Strong demos earn trust by being explicit about security boundaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-primary/20 bg-primary/10 p-5 text-sm leading-7 text-white/80">
              Sentinel is good at intent mismatch detection, approval abuse checks, batched-call
              visibility, novelty analysis, and policy gating before a user signs.
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 text-sm leading-7 text-white/72">
              Sentinel does not claim to be full EVM execution, real MPC, or real zero-knowledge
              proving. It presents those layers honestly so operators can trust the output.
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
