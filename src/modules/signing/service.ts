import type { Severity, TransactionPayload } from "@/src/modules/transaction/types";

export function buildSigningPreview(payload: TransactionPayload, severity: Severity) {
  const mode = severity === "critical" ? "block" : severity === "high" ? "warn" : "allow";

  return {
    allowed: mode !== "block",
    mode,
    reason:
      mode === "block"
        ? "Policy blocked signing because the transaction matches a high-confidence attack or intent-mismatch pattern."
        : mode === "warn"
          ? "Policy requires explicit review because risk signals remain unresolved."
          : "Policy allows signing with standard safeguards."
    ,
    signer: mode === "block" ? "policy-blocked" : "external-wallet"
  } as const;
}
