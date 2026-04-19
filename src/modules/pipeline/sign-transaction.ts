import { analyzeTransaction } from "@/src/modules/pipeline/analyze-transaction";
import { transactionPayloadSchema } from "@/src/modules/transaction/schema";

export async function guardSignTransaction(rawPayload: unknown) {
  const payload = transactionPayloadSchema.parse(rawPayload);
  const analysis = await analyzeTransaction(payload);

  return {
    approved: analysis.signingPolicy.allowed,
    mode: analysis.signingPolicy.mode,
    reason: analysis.signingPolicy.reason,
    attestationAccepted: analysis.attestation.accepted,
    verdict: analysis.verdict
  };
}
