import { createHash } from "crypto";

import { consumeNullifier } from "@/src/modules/database/repository";
import type {
  ComplianceAttestation,
  Severity,
  TransactionPayload
} from "@/src/modules/transaction/types";

export async function recordComplianceAttestation(
  payload: TransactionPayload,
  severity: Severity
): Promise<{
  accepted: boolean;
  record: ComplianceAttestation;
}> {
  const nullifier = createHash("sha256")
    .update(`${payload.from}:${payload.to}:${payload.data}:${severity}`)
    .digest("hex")
    .slice(0, 24);

  const record: ComplianceAttestation = {
    attestationId: `att_${nullifier.slice(0, 10)}`,
    nullifier,
    policy: severity === "critical" ? "policy-review-required" : "policy-screened",
    createdAt: new Date().toISOString(),
    persistent: Boolean(process.env.DATABASE_URL)
  };

  const accepted = await consumeNullifier(nullifier, record.policy);
  return {
    accepted,
    record
  };
}
