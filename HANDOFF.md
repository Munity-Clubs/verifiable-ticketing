# Handoff — `@munityclubs/verifiable-ticketing`

> One-page orientation for anyone landing on this repo cold: a new collaborator, a code auditor, a grant reviewer, or future-you after a long context switch.

## What this is

Dual-chain (Solana + EVM) NFT ticketing primitive. The package gives apps the portable building blocks around a ticketing flow: QR payload parsing, scanner-link tokens with TTL + revocation, event-expiry math, ticket record shape, and scan-result normalization. It does **not** own database state, RPC reads, or wallet auth — those stay in the integrating application. This boundary is intentional: any consumer app can adopt the package without restructuring its data layer.

## Current state (2026-05-24)

- **Version:** `v0.1.0` (npm) — published 2026-05-20
- **License:** Apache-2.0 (includes patent grant covering the signed-QR + scanner-token mechanism)
- **Stability:** v0.1 surface is stable. Scanner-side API contracts (`/scan/[token]/verify`, `/mark-used`) are exercised by Munity in production and considered frozen for v0.1.
- **Experimental:** none in v0.1.
- **Open work:** v0.2 ships refund-and-transfer mechanism, batch scanner mode (>500 scans/min), Lu.ma or Cal.com adapter, TypeScript port. See application drafts under `docs/grants/applications/superteam-instagrants-*` in the Munity webapp repo.

## How it fits the Munity stack

- **Munity webapp** (`src/utils/ticketing/`) is the production consumer. Files: `ownership.js`, `qrPayload.js`, `scannerLinks.js`, `scannerTokens.js`, `tickets.js`, `tierGate.js`.
- **Scanner-side API routes:** `src/pages/api/scan/[token]/{index,verify,mark-used}.js`.
- **Solana v2 program** (`4PeTcJYm5rPj4AU3Lq72nhpbyUxny2vJDTW6XUdpDDpk`) provides the on-chain ticket NFTs; this package verifies ownership via `getTokenAccountsByOwner`.
- **EVM** (Ethereum mainnet `0x55c3…4941`, Polygon `0xaF02…08db`) — ERC-1155 ticket tokens; verified via `balanceOf`.
- **Companion packages:** `@munityclubs/nft-feature-gating` (same gating-decision shape, different surface — community feature gating vs. ticket admit gating).

## Where it's deployed

| Surface | Address / URL |
|---|---|
| npm | [`@munityclubs/verifiable-ticketing@0.1.0`](https://www.npmjs.com/package/@munityclubs/verifiable-ticketing) |
| Source | [github.com/Munity-Clubs/verifiable-ticketing](https://github.com/Munity-Clubs/verifiable-ticketing) |
| Solana v2 program | [`4PeTcJYm5rPj4AU3Lq72nhpbyUxny2vJDTW6XUdpDDpk`](https://explorer.solana.com/address/4PeTcJYm5rPj4AU3Lq72nhpbyUxny2vJDTW6XUdpDDpk) |
| Ethereum mainnet | [`0x55c31189539606D5b1Cb61d01D34E9180fca4941`](https://etherscan.io/address/0x55c31189539606D5b1Cb61d01D34E9180fca4941) |
| Polygon | [`0xaF02eFB0a310FAd8C3Af3F01EB50EddF966908db`](https://polygonscan.com/address/0xaF02eFB0a310FAd8C3Af3F01EB50EddF966908db) |

## How to verify

```bash
npm view @munityclubs/verifiable-ticketing dist
git clone https://github.com/Munity-Clubs/verifiable-ticketing
cd verifiable-ticketing && npm install && npm test
```

The Solana v2 program is OtterSec-verified ([verify.osec.io/status/4PeTc…](https://verify.osec.io/status/4PeTcJYm5rPj4AU3Lq72nhpbyUxny2vJDTW6XUdpDDpk)); EVM contracts are Sourcify Exact Match (Solidity 0.8.24).

## Roadmap pointer

v0.2 milestones are committed publicly across three grant drafts in the Munity webapp repo at [`docs/grants/applications/superteam-instagrants-{usa,global,india-coindca}-draft-v1.md`](https://github.com/kidofthenorth/munity-full-stack/tree/final-merge/docs/grants/applications). Each names the same v0.2 ship targets — refund-and-transfer, batch scanner, Lu.ma/Cal.com adapter, TypeScript port — with chapter-specific framing.

## Security + disclosure

- See [`SECURITY.md`](./SECURITY.md) for vulnerability reporting policy and in-scope surface.
- Contact: `security@munity.club`
- RFC 9116: [`munity.club/.well-known/security.txt`](https://munity.club/.well-known/security.txt)
- Sec3 third-party audit engagement letter on file 2026-05-20.