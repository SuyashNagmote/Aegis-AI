import { createHash, createHmac } from "crypto";

import type { AnalysisResult } from "@/src/modules/transaction/types";

export function signAnalysisResult(result: Omit<AnalysisResult, "resultIntegrity">) {
  const secret = process.env.ANALYSIS_SIGNING_SECRET ?? "sentinel-dev-secret";
  const payload = JSON.stringify(result);
  const publicDigest = createHash("sha256").update(payload).digest("hex");
  const signature = createHmac("sha256", secret).update(payload).digest("hex");

  return {
    signature,
    algorithm: "hmac-sha256" as const,
    verifier: "backend-shared-secret" as const,
    publicDigest,
    verificationId: `verify_${publicDigest.slice(0, 12)}`
  };
}
