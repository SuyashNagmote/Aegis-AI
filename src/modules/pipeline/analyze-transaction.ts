import { createHash } from "crypto";

import { decodeTransaction } from "@/src/modules/blockchain/decoder";
import { getChainContext } from "@/src/modules/blockchain/provider";
import { explainTransaction } from "@/src/modules/ai/explainer";
import { readCache, writeCache } from "@/src/modules/cache/redis";
import { getFeedbackCount, recordAnalysis } from "@/src/modules/database/repository";
import { logEvent } from "@/src/modules/observability/logger";
import { getReputationContext, reputationFindings } from "@/src/modules/reputation/service";
import { evaluateRisk } from "@/src/modules/risk/engine";
import { signAnalysisResult } from "@/src/modules/security/integrity";
import { buildSigningPreview } from "@/src/modules/signing/service";
import { simulateTransaction } from "@/src/modules/simulation/service";
import { transactionPayloadSchema } from "@/src/modules/transaction/schema";
import type { AnalysisResult, TransactionPayload } from "@/src/modules/transaction/types";
import { recordComplianceAttestation } from "@/src/modules/zk/service";

function cacheKey(payload: TransactionPayload, blockNumber?: number) {
  return createHash("sha256")
    .update(JSON.stringify({ payload, blockNumber: blockNumber ?? "heuristic" }))
    .digest("hex");
}

function buildSimulationSummary(source: "rpc" | "heuristic") {
  return {
    mode: source === "rpc" ? "rpc-estimate" : "heuristic",
    supportsNestedCalls: false,
    limitations: [
      "Preflight is advisory and does not execute a full EVM state transition.",
      "Nested multicall and flash-loan semantics still require a dedicated simulator.",
      "State can change between analysis and signing."
    ]
  } as const;
}

export async function analyzeTransaction(
  rawPayload: unknown,
  actorAddress?: string
): Promise<AnalysisResult> {
  const payload = transactionPayloadSchema.parse(rawPayload);
  const chainContext = await getChainContext(payload);
  const reputation = getReputationContext(payload);
  const key = cacheKey(payload, chainContext.blockNumber);
  const cached = await readCache(key);

  if (cached) {
    const parsed = JSON.parse(cached) as AnalysisResult;
    const attestation = await recordComplianceAttestation(payload, parsed.severity);
    const signingPolicy = buildSigningPreview(payload, parsed.severity);
    return {
      ...parsed,
      attestation,
      signingPolicy,
      telemetry: {
        ...parsed.telemetry,
        cached: true,
        liveRpc: chainContext.source === "rpc",
        feedbackCount: getFeedbackCount(),
        authMode: "wallet-signature",
        rateLimitMode: "memory"
      }
    } as AnalysisResult;
  }

  const decoded = decodeTransaction(payload);
  const simulation = await simulateTransaction(payload, decoded);
  const risk = evaluateRisk(payload, decoded, simulation.effects, {
    chainReverted: chainContext.callOutcome === "revert",
    newDestination: reputation.userNovelty === "new",
    repeatedSimilarTransactions: reputation.recentSimilarTransactions
  });
  const combinedFindings = [...risk.findings, ...reputationFindings(reputation)];
  const recalculatedScore = Math.min(
    1,
    Math.max(
      risk.score,
      reputation.destinationLabel === "deny" ? 0.95 : reputation.userNovelty === "new" ? 0.55 : 0.1,
      reputation.domainRisk === "suspicious" ? 0.82 : 0.1,
      chainContext.callOutcome === "revert" ? 0.65 : 0.1
    )
  );
  const severity =
    recalculatedScore >= 0.9
      ? "critical"
      : recalculatedScore >= 0.7
        ? "high"
        : recalculatedScore >= 0.45
          ? "medium"
          : "low";
  const verdict =
    severity === "critical"
      ? "Drain risk detected"
      : severity === "high"
        ? "Suspicious transaction"
        : severity === "medium"
          ? "Review required"
          : "Appears low risk";
  const attestation = await recordComplianceAttestation(payload, severity);
  const signingPolicy = buildSigningPreview(payload, severity);
  const explanation = await explainTransaction({
    payload,
    decoded,
    effects: simulation.effects,
    findings: combinedFindings,
    severity
  });

  const unsignedResult: Omit<AnalysisResult, "resultIntegrity"> = {
    summary: explanation.summary,
    verdict,
    score: recalculatedScore,
    confidence: Math.max(risk.confidence, reputation.confidence),
    severity,
    decoded,
    effects: simulation.effects,
    findings: combinedFindings,
    reasons: [
      ...risk.reasons,
      chainContext.callOutcome === "revert" ? "RPC preflight indicates possible execution failure." : "",
      reputation.domainRisk === "suspicious" ? "The supplied dapp origin appears suspicious." : ""
    ].filter(Boolean),
    intent: risk.intent,
    simulation: buildSimulationSummary(chainContext.source),
    intelligence: {
      sourceCount: 4,
      matchedSignals: combinedFindings.map((finding) => finding.id),
      hasBlocklistMatch: reputation.destinationLabel === "deny",
      hasDomainRisk: reputation.domainRisk === "suspicious"
    },
    chainContext,
    reputation,
    attestation,
    signingPolicy,
    telemetry: {
      usedOpenAI: explanation.usedOpenAI,
      liveRpc: chainContext.source === "rpc",
      cached: false,
      feedbackCount: getFeedbackCount(),
      authMode: "wallet-signature",
      rateLimitMode: "memory"
    }
  };

  const result: AnalysisResult = {
    ...unsignedResult,
    resultIntegrity: signAnalysisResult(unsignedResult)
  };

  await writeCache(key, JSON.stringify(result));
  await recordAnalysis(payload, result, actorAddress);
  logEvent("analysis.completed", {
    actorAddress: actorAddress ?? "anonymous",
    severity: result.severity,
    verdict: result.verdict,
    cached: false
  });

  return result;
}
