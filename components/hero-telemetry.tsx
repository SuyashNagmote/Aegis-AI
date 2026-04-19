"use client";

import { motion } from "framer-motion";
import { AlertTriangle, LockKeyhole, Radar, ScanSearch, ShieldCheck, Wallet } from "lucide-react";

const stages = [
  {
    icon: Wallet,
    title: "Wallet Preflight",
    text: "Opt-in interception of wallet transaction requests inside Sentinel-enabled sessions."
  },
  {
    icon: ScanSearch,
    title: "Decode + Simulate",
    text: "Calldata parsing, RPC-backed execution hints, and flow extraction before signing."
  },
  {
    icon: Radar,
    title: "Risk + Reputation",
    text: "Rules, wallet novelty, deny/allow intelligence, and contextual chain signals."
  },
  {
    icon: LockKeyhole,
    title: "Attestation",
    text: "Replay-protected signed results with persistent nullifier records when storage is configured."
  }
];

export function HeroTelemetry() {
  return (
    <div className="panel-glass relative overflow-hidden rounded-[36px] p-6 shadow-glow">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(89,243,194,0.18),transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative mb-5 flex items-center justify-between rounded-[28px] border border-white/10 bg-black/20 px-4 py-3">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-white/45">Sentinel Pipeline</div>
          <div className="mt-1 text-lg font-semibold text-white">From user intent to signing policy</div>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Production-style demo
        </div>
      </div>

      <div className="relative grid gap-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <stage.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-white">{stage.title}</div>
                  <motion.div
                    animate={{ opacity: [0.35, 1, 0.35], scale: [0.96, 1.04, 0.96] }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: index * 0.2 }}
                    className="h-2.5 w-2.5 rounded-full bg-primary"
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-white/66">{stage.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-5 flex items-center gap-3 rounded-[28px] border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-white/80">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span>Verdicts are deterministic. AI explanations are advisory, never the final safety decision.</span>
      </div>

      <div className="relative mt-4 grid gap-3 md:grid-cols-2">
        <div className="flex items-center gap-3 rounded-[28px] border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white/80">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Intent mismatch, permit, multicall, and novelty risk are surfaced before signing.</span>
        </div>
        <div className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/80">
          <Radar className="h-4 w-4 text-white/70" />
          <span>Simulation is clearly labeled as advisory so product trust stays honest.</span>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-3 rounded-[28px] border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white/80">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span>3D fluff removed in favor of product telemetry, policy state, and operator-ready signals.</span>
      </div>
    </div>
  );
}
