# Sentinel AI

Sentinel AI is a startup-style MVP for AI-powered transaction security on digital assets. It intercepts transactions before signing, decodes intent, simulates effects, scores risk, generates human-readable explanations, verifies a ZK-style compliance proof, and produces a guarded signing decision.

## Stack

- Next.js App Router
- Tailwind CSS
- Framer Motion
- React Three Fiber
- Ethers.js
- OpenAI API with deterministic fallback summaries
- Prisma + PostgreSQL
- Redis cache wrapper

## What the MVP Includes

- Premium landing page with animated product telemetry
- Dashboard to paste or load raw transaction payloads
- REST API for transaction analysis and guarded signing
- Rule-based risk engine for:
  - unlimited approvals
  - suspicious destinations
  - phishing-like context
  - opaque contract calls
  - high-value outflows
- Human-readable explanation layer
- Transaction simulation view
- Signed attestation result and nullifier replay check
- Wallet auth, rate limiting, and in-app transaction interception
- Prisma schema for transaction logs
- Redis-backed cache with in-memory fallback

## Local Run

1. Copy `.env.example` to `.env.local`.
2. Install dependencies with `npm install`.
3. Generate Prisma client with `npm run prisma:generate`.
4. Optional: start PostgreSQL and Redis with `docker compose up -d`.
5. Start the app with `npm run dev`.

## Example API

`POST /api/analyze`

```json
{
  "chainId": 1,
  "from": "0xA11ce00000000000000000000000000000001234",
  "to": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "value": "0",
  "data": "0x095ea7b3000000000000000000000000deaddeaddeaddeaddeaddeaddeaddeaddead0001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "tokenSymbol": "USDC",
  "tokenDecimals": 6,
  "trusted": false,
  "metadata": {
    "source": "Claim airdrop",
    "dappName": "FreeYield Pro"
  }
}
```

## Architecture

Client -> API route -> decode -> simulate -> risk engine -> reputation/context -> signed attestation -> signing guard -> persistence/cache
