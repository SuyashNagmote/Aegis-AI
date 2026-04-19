import { ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <main className="pb-20">
      <SiteHeader />
      <section className="container-shell pt-14">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-4">
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              Live transaction analysis workspace
            </Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                Production-style pre-sign security console
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-white/65">
                Capture user intent, analyze raw payloads, surface why a transaction is risky, and
                turn that into a policy decision before a user or AI agent signs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Built to demo wallet and agent safety flows without fake security claims
          </div>
        </div>
        <DashboardShell />
      </section>
    </main>
  );
}
