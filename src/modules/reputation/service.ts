import { getMemoryLogs } from "@/src/modules/database/repository";
import type {
  ReputationContext,
  RiskFinding,
  TransactionPayload
} from "@/src/modules/transaction/types";

const allowlist = new Set(["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]);
const denylist = new Set([
  "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001",
  "0xfacefacefacefacefacefacefacefaceface0002"
]);
const suspiciousDomains = [/verify/i, /claim/i, /wallet/i, /bonus/i, /free/i];
const trustedDomains = [/aegis/i, /payroll/i, /treasury/i];

export function getReputationContext(payload: TransactionPayload): ReputationContext {
  const target = payload.to.toLowerCase();
  const logs = getMemoryLogs().filter((entry) => entry.payload.from.toLowerCase() === payload.from.toLowerCase());
  const knownDestination = logs.some(
    (entry) => entry.payload.to.toLowerCase() === payload.to.toLowerCase()
  );
  const recentSimilarTransactions = logs.filter(
    (entry) =>
      entry.payload.to.toLowerCase() === target &&
      entry.payload.data.slice(0, 10) === payload.data.slice(0, 10)
  ).length;
  const url = payload.metadata?.url ?? "";
  const domainRisk = suspiciousDomains.some((pattern) => pattern.test(url))
    ? "suspicious"
    : trustedDomains.some((pattern) => pattern.test(url))
      ? "trusted"
      : "unknown";

  return {
    destinationLabel: denylist.has(target) ? "deny" : allowlist.has(target) ? "allow" : "unknown",
    confidence: denylist.has(target) || allowlist.has(target) ? 0.9 : knownDestination ? 0.6 : 0.35,
    contractAgeBlocks: logs.length > 0 ? 1_000 + logs.length * 10 : undefined,
    hasVerifiedCodeHint: allowlist.has(target),
    userNovelty: knownDestination ? "known" : "new",
    walletInteractionCount: logs.length,
    recentSimilarTransactions,
    domainRisk
  };
}

export function reputationFindings(context: ReputationContext): RiskFinding[] {
  const findings: RiskFinding[] = [];

  if (context.destinationLabel === "deny") {
    findings.push({
      id: "reputation-deny",
      title: "Destination reputation is blocked",
      description:
        "The destination appears on Sentinel's denylist or prior fraud intelligence feed.",
      severity: "critical",
      action: "Do not sign until the destination is independently cleared."
    });
  }

  if (context.userNovelty === "new") {
    findings.push({
      id: "user-novelty",
      title: "New destination for this wallet",
      description:
        "This wallet has not interacted with the destination in the current history window.",
      severity: "medium",
      action: "Ask for explicit confirmation because this is behaviorally unusual."
    });
  }

  if (context.domainRisk === "suspicious") {
    findings.push({
      id: "domain-risk",
      title: "Suspicious dapp origin",
      description:
        "The supplied dapp URL contains patterns commonly seen in phishing, urgency prompts, or fake verification flows.",
      severity: "high",
      action: "Verify the domain independently before signing or connecting a wallet."
    });
  }

  return findings;
}
