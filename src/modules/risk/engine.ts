import type {
  DecodedAction,
  RiskFinding,
  Severity,
  SimulationEffect,
  TransactionPayload,
  UserIntent
} from "@/src/modules/transaction/types";

const suspiciousContracts = new Set([
  "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001",
  "0xfacefacefacefacefacefacefacefaceface0002"
]);

const riskySources = [/airdrop/i, /verify/i, /urgent/i, /claim/i];
const replaySelectors = new Set(["0xd505accf"]);
const sensitiveMethods = new Set(["permit2", "multicall", "approve", "permit"]);
const intentMap: Record<UserIntent, string[]> = {
  send: ["transfer", "native-transfer"],
  claim: ["transfer", "native-transfer"],
  swap: ["multicall", "contract-call", "transfer", "approve"],
  approve: ["approve", "permit", "grant-permissions"],
  "grant-permissions": ["approve", "permit"],
  "contract-call": ["contract-call", "multicall"],
  other: ["contract-call", "multicall", "transfer", "native-transfer", "approve", "permit"]
};

function rank(severity: Severity) {
  return {
    low: 0.25,
    medium: 0.5,
    high: 0.75,
    critical: 0.95
  }[severity];
}

export function evaluateRisk(
  payload: TransactionPayload,
  decoded: DecodedAction,
  effects: SimulationEffect[],
  options?: {
    chainReverted?: boolean;
    newDestination?: boolean;
    repeatedSimilarTransactions?: number;
  }
): {
    findings: RiskFinding[];
    score: number;
    severity: Severity;
    verdict: string;
    confidence: number;
    reasons: string[];
    intent: {
      declared?: UserIntent;
      inferred: string;
      matches: boolean;
      explanation: string;
    };
} {
  const findings: RiskFinding[] = [];
  const reasons: string[] = [];
  const inferredIntent =
    decoded.kind === "approve" || decoded.kind === "permit"
      ? "grant-permissions"
      : decoded.kind === "transfer" || decoded.kind === "native-transfer"
        ? "send"
        : decoded.kind === "multicall"
          ? "swap-or-batched-call"
          : "contract-call";
  const declaredIntent = payload.metadata?.intent;
  const matchesIntent = !declaredIntent || intentMap[declaredIntent]?.includes(decoded.kind) || false;

  if (decoded.kind === "approve" && decoded.isUnlimited) {
    findings.push({
      id: "unlimited-approval",
      title: "Unlimited token approval",
      description:
        "This signature would allow the spender to move all approved tokens later without asking again.",
      severity: "critical",
      action: "Block by default unless this spender is audited and expected."
    });
    reasons.push("Unlimited approval can grant long-lived control over wallet assets.");
  }

  if (decoded.kind === "permit") {
    findings.push({
      id: "permit-signature",
      title: "Off-chain approval signature",
      description:
        "This action uses permit-style signing, which can grant token spending rights without an on-chain approval transaction.",
      severity: "high",
      action: "Only sign permit payloads from verified apps with clear business intent."
    });
    reasons.push("Permit signatures can be abused because users often mistake them for harmless logins.");
  }

  if (decoded.kind === "multicall") {
    findings.push({
      id: "batched-execution",
      title: "Batched or nested contract execution",
      description:
        "The transaction bundles multiple inner calls, which is a common structure for advanced drains and hidden approval flows.",
      severity: "high",
      action: "Expand every inner call or block if the batch cannot be decoded safely."
    });
    reasons.push("Nested call batches reduce transparency and make phishing payloads harder to inspect.");
  }

  if (decoded.kind === "native-transfer" && Number(decoded.amount) >= 1) {
    findings.push({
      id: "high-value-native-transfer",
      title: "High value native asset transfer",
      description:
        "The transaction directly sends a meaningful amount of native currency out of the wallet.",
      severity: "high",
      action: "Verify the recipient and business intent before proceeding."
    });
    reasons.push("Large native transfers are irreversible and should match a clear user action.");
  }

  if (!payload.trusted) {
    findings.push({
      id: "untrusted-context",
      title: "Untrusted contract context",
      description:
        "The destination is not marked as trusted, so this request should be treated as potentially hostile.",
      severity: "high",
      action: "Ask for additional verification or route through a policy engine."
    });
    reasons.push("The transaction comes from an untrusted context.");
  }

  if (suspiciousContracts.has(payload.to.toLowerCase())) {
    findings.push({
      id: "suspicious-contract",
      title: "Known suspicious destination",
      description:
        "The contract matches a denylist entry used by Sentinel's heuristic detector.",
      severity: "critical",
      action: "Block signing and escalate for review."
    });
    reasons.push("Destination address matches a local denylist signal.");
  }

  if (
    riskySources.some((pattern) =>
      pattern.test(`${payload.metadata?.source ?? ""} ${payload.metadata?.dappName ?? ""}`)
    )
  ) {
    findings.push({
      id: "phishing-pattern",
      title: "Phishing-style language detected",
      description:
        "The source metadata contains patterns often used in fake claims and urgent wallet verification prompts.",
      severity: "medium",
      action: "Cross-check the dapp domain and expected user journey."
    });
    reasons.push("The dapp metadata contains phishing-style urgency or reward language.");
  }

  if (decoded.kind === "contract-call" && !decoded.method) {
    findings.push({
      id: "opaque-call",
      title: "Opaque contract call",
      description:
        "The calldata could not be resolved into a known safe function, increasing the risk of blind signing.",
      severity: "high",
      action: "Simulate on a trusted engine or require manual review."
    });
    reasons.push("The call selector is not transparently decoded.");
  }

  if (decoded.kind === "contract-call" && decoded.method && sensitiveMethods.has(decoded.method)) {
    findings.push({
      id: "sensitive-method",
      title: "Sensitive contract method detected",
      description:
        `The selector maps to ${decoded.method}, which often appears in permissioned or batched execution flows.`,
      severity: "high",
      action: "Require explicit confirmation of what this method changes before signing."
    });
    reasons.push(`Sensitive method ${decoded.method} needs stronger scrutiny.`);
  }

  if (replaySelectors.has(decoded.kind === "contract-call" ? decoded.selector : "")) {
    findings.push({
      id: "signature-replay-surface",
      title: "Replay-prone signature pathway",
      description:
        "The payload uses a selector associated with delegated approvals that should be checked for expiry, nonce binding, and spender scope.",
      severity: "high",
      action: "Reject signatures without clear expiry, nonce, and spender validation."
    });
    reasons.push("Delegated signature flows increase replay and misuse risk.");
  }

  if (!matchesIntent && declaredIntent) {
    findings.push({
      id: "intent-mismatch",
      title: "Declared intent does not match decoded action",
      description:
        `The user flow says "${declaredIntent}" but the transaction decodes as "${inferredIntent}". This mismatch is a common scam pattern.`,
      severity: "critical",
      action: "Block by default and ask the user to confirm what they expected to happen."
    });
    reasons.push("Intent mismatch is one of the strongest phishing indicators.");
  }

  if (options?.newDestination) {
    findings.push({
      id: "new-destination",
      title: "First-time destination for this wallet",
      description:
        "This wallet has little or no prior history with the destination, which raises novelty risk.",
      severity: "medium",
      action: "Ask for confirmation because the counterparty is behaviorally new."
    });
    reasons.push("The destination is new for this wallet.");
  }

  if ((options?.repeatedSimilarTransactions ?? 0) >= 3) {
    findings.push({
      id: "burst-pattern",
      title: "Repeated similar transaction burst",
      description:
        "The wallet has generated several near-identical transactions recently, which can indicate automation, retries, or attack loops.",
      severity: "medium",
      action: "Throttle signing and review why the same call is repeating."
    });
    reasons.push("Bursting similar transactions may indicate a compromised flow.");
  }

  if (options?.chainReverted) {
    findings.push({
      id: "revert-on-simulation",
      title: "Execution reverted during preflight",
      description:
        "RPC preflight indicates the call may revert, which can mean stale state, malformed calldata, or hidden control flow.",
      severity: "medium",
      action: "Do not sign until the revert reason and current chain state are understood."
    });
    reasons.push("Preflight execution did not complete cleanly.");
  }

  if (effects.some((effect) => effect.direction === "out") && findings.length === 0) {
    findings.push({
      id: "normal-outflow",
      title: "Expected outbound movement",
      description:
        "Assets leave the wallet as part of the transaction, but no malicious pattern was detected.",
      severity: "low",
      action: "Proceed if the amount and recipient match user intent."
    });
  }

  const score = Math.min(
    1,
    findings.reduce((max, finding) => Math.max(max, rank(finding.severity)), 0.08) +
      Math.min(0.18, findings.length * 0.03)
  );

  const severity =
    score >= 0.9 ? "critical" : score >= 0.7 ? "high" : score >= 0.45 ? "medium" : "low";

  const verdict =
    severity === "critical"
      ? "Do not sign"
      : severity === "high"
        ? "High-risk transaction"
        : severity === "medium"
          ? "Review before signing"
          : "Low-risk but verify";
  const confidence = Math.min(
    0.98,
    0.52 +
      findings.length * 0.08 +
      (matchesIntent ? 0.04 : 0.14) +
      (payload.trusted ? 0.03 : 0) +
      (options?.chainReverted ? 0.06 : 0)
  );

  return {
    findings,
    score,
    severity,
    verdict,
    confidence,
    reasons: reasons.slice(0, 4),
    intent: {
      declared: declaredIntent,
      inferred: inferredIntent,
      matches: matchesIntent,
      explanation: matchesIntent
        ? "The decoded action is broadly consistent with the declared user goal."
        : "The decoded action conflicts with the user's declared goal, which is a strong phishing signal."
    }
  };
}
