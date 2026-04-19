import OpenAI from "openai";

import type {
  DecodedAction,
  RiskFinding,
  Severity,
  SimulationEffect,
  TransactionPayload
} from "@/src/modules/transaction/types";

function localSummary(
  payload: TransactionPayload,
  decoded: DecodedAction,
  effects: SimulationEffect[],
  findings: RiskFinding[],
  severity: Severity
) {
  const effectLine =
    effects[0]?.direction === "approval"
      ? `This request changes token allowance for ${effects[0].to}.`
      : effects[0]
        ? `This request moves ${effects[0].amount} ${effects[0].asset} from the wallet.`
        : "This request interacts with a contract in a way that needs review.";

  const findingLine = findings[0]
    ? `${findings[0].title}: ${findings[0].description}`
    : "No major malicious pattern was identified.";
  const opener =
    severity === "critical"
      ? "DO NOT SIGN THIS TRANSACTION."
      : severity === "high"
        ? "High-risk transaction detected."
        : severity === "medium"
          ? "Review this transaction carefully before signing."
          : "Low-risk transaction, but still verify intent.";

  const decodedLine =
    decoded.kind === "approve"
      ? `The decoded action is an approval for ${decoded.spender}.`
      : decoded.kind === "permit"
        ? `The decoded action is an off-chain permit for ${decoded.spender}.`
        : decoded.kind === "multicall"
          ? `The decoded action is a batched multicall against ${decoded.target}.`
      : decoded.kind === "transfer" || decoded.kind === "native-transfer"
        ? `The decoded action is a transfer to ${decoded.recipient}.`
        : `The decoded action is a ${decoded.method ?? "raw contract"} call.`;

  return `${opener} ${decodedLine} ${effectLine} ${findingLine} Overall severity is ${severity}. This explanation is advisory only; the policy verdict comes from deterministic controls, not the language model. Source: ${payload.metadata?.dappName ?? "Unknown dapp"}.`;
}

export async function explainTransaction(input: {
  payload: TransactionPayload;
  decoded: DecodedAction;
  effects: SimulationEffect[];
  findings: RiskFinding[];
  severity: Severity;
}): Promise<{ summary: string; usedOpenAI: boolean }> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: localSummary(
        input.payload,
        input.decoded,
        input.effects,
        input.findings,
        input.severity
      ),
      usedOpenAI: false
    };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You explain blockchain transactions before signing. Never decide whether a transaction is safe. Be concise, explicit, protective, and direct. For high risk or critical risk, start with a strong warning like DO NOT SIGN THIS TRANSACTION. State that the final verdict comes from deterministic controls, not the language model."
        },
        {
          role: "user",
          content: JSON.stringify(input)
        }
      ]
    });

    return {
      summary:
        completion.output_text ||
        localSummary(
          input.payload,
          input.decoded,
          input.effects,
          input.findings,
          input.severity
        ),
      usedOpenAI: true
    };
  } catch {
    return {
      summary: localSummary(
        input.payload,
        input.decoded,
        input.effects,
        input.findings,
        input.severity
      ),
      usedOpenAI: false
    };
  }
}
