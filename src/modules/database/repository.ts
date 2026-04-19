import type { AnalysisResult, TransactionPayload } from "@/src/modules/transaction/types";
import { prisma } from "@/src/modules/database/prisma";

const memoryLog: Array<{ payload: TransactionPayload; result: AnalysisResult }> = [];
const memoryNullifiers = new Set<string>();
const memoryFeedback: Array<{ actorAddress: string; verdict: string; notes?: string }> = [];

export async function recordAnalysis(
  payload: TransactionPayload,
  result: AnalysisResult,
  actorAddress?: string
) {
  memoryLog.push({ payload, result });

  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.transactionLog.create({
      data: {
        chainId: payload.chainId,
        fromAddress: payload.from,
        toAddress: payload.to,
        value: payload.value,
        calldata: payload.data,
        verdict: result.verdict,
        severity: result.severity,
        score: result.score,
        findingsJson: JSON.stringify(result.findings),
        effectsJson: JSON.stringify(result.effects),
        metadataJson: JSON.stringify(payload.metadata ?? {}),
        actorAddress
      }
    });
  } catch {
    return;
  }
}

export function getMemoryLogs() {
  return memoryLog;
}

export async function consumeNullifier(nullifier: string, policy: string) {
  if (!process.env.DATABASE_URL) {
    if (memoryNullifiers.has(nullifier)) return false;
    memoryNullifiers.add(nullifier);
    return true;
  }

  try {
    const existing = await prisma.complianceNullifier.findUnique({
      where: { nullifier }
    });

    if (existing) return false;

    await prisma.complianceNullifier.create({
      data: {
        nullifier,
        policy
      }
    });

    return true;
  } catch {
    if (memoryNullifiers.has(nullifier)) return false;
    memoryNullifiers.add(nullifier);
    return true;
  }
}

export async function recordFeedback(actorAddress: string, verdict: string, notes?: string) {
  memoryFeedback.push({ actorAddress, verdict, notes });

  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.transactionFeedback.create({
      data: {
        actorAddress,
        verdict,
        notes
      }
    });
  } catch {
    return;
  }
}

export function getFeedbackCount() {
  return memoryFeedback.length;
}
