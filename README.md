# @munityclubs/verifiable-ticketing

Reusable QR ticket and scanner-link primitives extracted from Munity's
dual-chain NFT ticketing flow.

The package does not own your database or chain RPC reads. It gives apps the
portable pieces around QR payload parsing, scanner-link tokens, event expiry,
ticket record shape, and scan-result normalization.

## Install

```bash
npm install @munityclubs/verifiable-ticketing
```

## Usage

```js
import {
  extractTicketIdFromQrPayload,
  buildTicketRecord,
  buildScanResult,
  hashOpaqueToken,
} from "@munityclubs/verifiable-ticketing";

const ticketId = extractTicketIdFromQrPayload(qrPayload);
const tokenHash = hashOpaqueToken(scannerToken);

const ticket = buildTicketRecord({
  collection,
  communityId,
  holderAddress: buyerWallet,
  txSignature,
  index: 0,
});

const result = buildScanResult({
  ticket,
  ownsTicket: true,
  scan: null,
});
```

## What It Covers

- Opaque scanner-token generation and SHA-256 hashing
- Constant-time token-hash comparison
- QR payload parsing from raw IDs, JSON, or URLs
- EVM transaction signature normalization
- Scanner-link expiry and inactive-reason checks
- Portable ticket-record and scan-result shapes

Apps still need to enforce event ownership, ticket ownership on-chain, scanner
authorization, and one-time scan persistence in their own storage layer.

## Development

```bash
yarn install
yarn test
```

## License

Apache-2.0
