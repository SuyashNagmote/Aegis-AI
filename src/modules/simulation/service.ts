import type {
  DecodedAction,
  SimulationEffect,
  TransactionPayload
} from "@/src/modules/transaction/types";

type SimulationResult = {
  effects: SimulationEffect[];
  usedTenderly: boolean;
};

export async function simulateTransaction(
  payload: TransactionPayload,
  decoded: DecodedAction
): Promise<SimulationResult> {
  const effects: SimulationEffect[] = [];

  if (decoded.kind === "approve") {
    effects.push({
      label: decoded.isUnlimited ? "Unlimited allowance granted" : "Allowance update",
      from: payload.from,
      to: decoded.spender,
      asset: decoded.tokenSymbol,
      amount: decoded.isUnlimited ? "Unlimited" : decoded.amount,
      direction: "approval"
    });
  }

  if (decoded.kind === "permit") {
    effects.push({
      label: "Off-chain spending permission",
      from: payload.from,
      to: decoded.spender,
      asset: decoded.tokenSymbol,
      amount: decoded.amount ?? "Variable",
      direction: "approval"
    });
  }

  if (decoded.kind === "multicall") {
    effects.push({
      label: `Batched execution (${decoded.innerCalls} calls)`,
      from: payload.from,
      to: decoded.target,
      asset: payload.tokenSymbol ?? "Mixed assets",
      amount: payload.value === "0" ? "N/A" : payload.value,
      direction: "out"
    });
  }

  if (decoded.kind === "transfer" || decoded.kind === "native-transfer") {
    effects.push({
      label: "Assets leave wallet",
      from: payload.from,
      to: decoded.recipient,
      asset: decoded.tokenSymbol,
      amount: decoded.amount,
      direction: "out"
    });
  }

  if (decoded.kind === "contract-call") {
    effects.push({
      label: decoded.method ? `Contract call: ${decoded.method}` : "Opaque contract interaction",
      from: payload.from,
      to: decoded.target,
      asset: payload.tokenSymbol ?? "Unknown asset",
      amount: payload.value === "0" ? "N/A" : payload.value,
      direction: "out"
    });
  }

  return {
    effects,
    usedTenderly: false
  };
}
