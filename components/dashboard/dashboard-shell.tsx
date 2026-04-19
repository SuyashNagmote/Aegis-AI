"use client";

import dynamic from "next/dynamic";

const ClientDashboard = dynamic(
  () => import("@/components/dashboard/client-dashboard").then((module) => module.ClientDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[28px] border border-white/10 bg-card/90 p-6 text-white/60 backdrop-blur-2xl">
        Loading dashboard...
      </div>
    )
  }
);

export function DashboardShell() {
  return <ClientDashboard />;
}
