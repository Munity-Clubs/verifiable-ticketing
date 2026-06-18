# Security Policy

## Reporting a Vulnerability

If you believe you have found a security vulnerability in `@munityclubs/verifiable-ticketing`, please report it privately by emailing **`security@munity.club`**.

Please do **not** open public GitHub issues for suspected security vulnerabilities. The maintainers monitor `security@munity.club` and will route reports to the engineering owner.

## Response Targets

- **First acknowledgment**: within 48 hours of receipt
- **Substantive response with triage outcome**: within 5 business days
- **Coordinated-disclosure default window**: 90 days from report to public disclosure or first patch release, whichever is sooner. Adjusted case-by-case with the reporter.

## In-Scope Surface

- QR payload encoding / decoding (`extractTicketIdFromQrPayload`) — JSON injection, URL-parameter confusion, payload-mismatch bypass paths
- Scanner-link token issuance, hashing (`hashOpaqueToken`), TTL expiry, and revocation correctness
- Scanner-link scoping invariants (collection, event date, grace window) — cross-collection or cross-event reuse
- Ticket ownership-verification path (Solana `getTokenAccountsByOwner`, EVM `balanceOf`) against forgery or stale-cache attacks
- Mark-used semantics — race conditions, replay-after-mark, double-entry paths
- Signed scanner-token tamper resistance (key derivation, signature length, signature-comparison timing)
- Rate-limit bypass paths around `/scan/[token]/*` integrations
- Tier-gate evaluation correctness (`tierGate.js`) against tier-spoofing or off-by-one boundary attacks

## Out of Scope

- Application-layer vulnerabilities in projects integrating this package
- Underlying chain-RPC provider correctness or availability (handled per integrator transport)
- Wallet-adapter implementation bugs (signing UX is integrator-side)
- Transitive-dependency issues that already have published advisories
- Network-level attacks (DNS, BGP, TLS downgrade)
- Phishing or social engineering against end users
- Scanner-device camera or OS-permission bugs

## Supported Versions

The latest published minor version on the `main` branch is supported. Previous minor versions receive security patches for **90 days** after a new minor ships. Patch releases are tagged and announced in `CHANGELOG.md`.

## Public Audit Status

A third-party security audit (Sec3 engagement letter on file 2026-05-20) of v0.2 is planned (target ship: September 2026) contingent on grant funding. Audit findings will be published in the `audits/` directory of this repository before v0.2 is released to npm.

## Disclosure Acknowledgments

Researchers who report valid vulnerabilities under this policy are credited in the corresponding release notes and, with their permission, in this `SECURITY.md` after disclosure.

## Contact

**`security@munity.club`**

Munity maintains `security@munity.club` as the dedicated channel for vulnerability reports across all `@munityclubs/*` packages. See also: [munity.club/.well-known/security.txt](https://munity.club/.well-known/security.txt) (RFC 9116). PGP key publication is on the v0.2 roadmap.