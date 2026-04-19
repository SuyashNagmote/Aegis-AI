import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/src/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#041019d4]/84 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_14px_30px_rgba(89,243,194,0.14)]">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.3em] text-white/70">SENTINEL AI</div>
            <div className="text-xs text-white/45">Intent-aware transaction security</div>
          </div>
        </Link>
        <div className="hidden items-center gap-3 md:flex">
          <Badge className="border-primary/20 bg-primary/10 text-primary">Live intent + risk analysis</Badge>
          <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/45">
            Policy-first security
          </div>
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-white/10"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Open dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
