import { JsonRpcProvider, parseEther, toQuantity } from "ethers";

import type { ChainContext, TransactionPayload } from "@/src/modules/transaction/types";

let provider: JsonRpcProvider | null = null;

function normalizeValue(value: string) {
  if (!value || value === "0") return undefined;
  if (value.startsWith("0x")) {
    return BigInt(value);
  }
  return parseEther(value);
}

export function getProvider() {
  if (!process.env.RPC_URL) return null;
  if (!provider) {
    provider = new JsonRpcProvider(process.env.RPC_URL);
  }
  return provider;
}

export async function getChainContext(payload: TransactionPayload): Promise<ChainContext> {
  const rpc = getProvider();
  if (!rpc) {
    return {
      codePresent: true,
      gasInsight: "unavailable",
      callOutcome: "unknown",
      source: "heuristic",
      simulationMode: "heuristic"
    };
  }

  try {
    const [blockNumber, code, transactionCount] = await Promise.all([
      rpc.getBlockNumber(),
      rpc.getCode(payload.to),
      rpc.getTransactionCount(payload.to)
    ]);

    let estimateGas: string | undefined;
    let callOutcome: ChainContext["callOutcome"] = "unknown";
    let gasInsight: ChainContext["gasInsight"] = "unavailable";

    try {
      const gas = await rpc.estimateGas({
        from: payload.from,
        to: payload.to,
        data: payload.data,
        value: normalizeValue(payload.value)
      });
      estimateGas = gas.toString();
      callOutcome = "success";
      gasInsight = "estimated";
    } catch {
      try {
        await rpc.call(
          {
            from: payload.from,
            to: payload.to,
            data: payload.data,
            value: payload.value === "0" ? undefined : toQuantity(normalizeValue(payload.value) ?? 0n)
          }
        );
        callOutcome = "success";
        gasInsight = "fallback";
      } catch {
        callOutcome = "revert";
        gasInsight = "fallback";
      }
    }

    return {
      blockNumber,
      codePresent: code !== "0x",
      transactionCount,
      estimateGas,
      gasInsight,
      callOutcome,
      source: "rpc",
      simulationMode: "rpc-estimate"
    };
  } catch {
    return {
      codePresent: true,
      gasInsight: "unavailable",
      callOutcome: "unknown",
      source: "heuristic",
      simulationMode: "heuristic"
    };
  }
}
