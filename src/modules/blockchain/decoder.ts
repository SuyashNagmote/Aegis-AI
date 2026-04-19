import { Interface, MaxUint256, formatUnits } from "ethers";

import type { DecodedAction, TransactionPayload } from "@/src/modules/transaction/types";

const erc20Interface = new Interface([
  "function approve(address spender, uint256 amount)",
  "function transfer(address to, uint256 amount)",
  "function transferFrom(address from, address to, uint256 amount)",
  "function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)",
  "function multicall(bytes[] data)"
]);

const knownSelectors: Record<string, string> = {
  "0xd505accf": "permit2",
  "0x095ea7b3": "approve",
  "0xa9059cbb": "transfer",
  "0x23b872dd": "transferFrom",
  "0xac9650d8": "multicall"
};

export function decodeTransaction(payload: TransactionPayload): DecodedAction {
  if (payload.data === "0x" || payload.data === "0x0") {
    return {
      kind: "native-transfer",
      recipient: payload.to,
      amount: payload.value,
      tokenSymbol: "ETH"
    };
  }

  try {
    const parsed = erc20Interface.parseTransaction({
      data: payload.data,
      value: BigInt(0)
    });

    if (!parsed) {
      return {
        kind: "contract-call",
        selector: payload.data.slice(0, 10),
        target: payload.to
      };
    }

    const decimals = payload.tokenDecimals ?? 18;
    const tokenSymbol = payload.tokenSymbol ?? "TOKEN";

    if (parsed.name === "approve") {
      const amount = parsed.args[1] as bigint;
      return {
        kind: "approve",
        spender: String(parsed.args[0]),
        amount: formatUnits(amount, decimals),
        isUnlimited: amount === MaxUint256,
        tokenSymbol
      };
    }

    if (parsed.name === "transfer") {
      return {
        kind: "transfer",
        recipient: String(parsed.args[0]),
        amount: formatUnits(parsed.args[1] as bigint, decimals),
        tokenSymbol
      };
    }

    if (parsed.name === "transferFrom") {
      return {
        kind: "transfer",
        recipient: String(parsed.args[1]),
        amount: formatUnits(parsed.args[2] as bigint, decimals),
        tokenSymbol
      };
    }

    if (parsed.name === "permit") {
      return {
        kind: "permit",
        owner: String(parsed.args[0]),
        spender: String(parsed.args[1]),
        amount: formatUnits(parsed.args[2] as bigint, decimals),
        deadline: String(parsed.args[3]),
        tokenSymbol
      };
    }

    if (parsed.name === "multicall") {
      const innerCalls = Array.isArray(parsed.args[0]) ? parsed.args[0].length : 0;
      return {
        kind: "multicall",
        target: payload.to,
        innerCalls,
        selector: payload.data.slice(0, 10)
      };
    }

    return {
      kind: "contract-call",
      method: parsed.name,
      selector: payload.data.slice(0, 10),
      target: payload.to
    };
  } catch {
    const selector = payload.data.slice(0, 10);
    return {
      kind: "contract-call",
      method: knownSelectors[selector],
      selector,
      target: payload.to
    };
  }
}
