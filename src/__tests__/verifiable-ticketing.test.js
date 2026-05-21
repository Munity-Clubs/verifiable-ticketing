import { describe, expect, it } from "vitest";

import {
  VerifiableTicketingError,
  buildScanResult,
  buildTicketRecord,
  constantTimeEqual,
  extractTicketIdFromQrPayload,
  generateOpaqueToken,
  getScannerLinkExpiry,
  hashOpaqueToken,
  normalizeTxSignature,
  scannerLinkInactiveReason,
  toTicketQrPayload,
} from "../index.js";

describe("@munityclubs/verifiable-ticketing", () => {
  it("parses QR payloads from raw ids, JSON, and URLs", () => {
    expect(extractTicketIdFromQrPayload("ticket_123")).toBe("ticket_123");
    expect(extractTicketIdFromQrPayload('{"ticket_id":"ticket_json"}')).toBe(
      "ticket_json",
    );
    expect(
      extractTicketIdFromQrPayload("https://munity.club/ticket?ticket=ticket_url"),
    ).toBe("ticket_url");
    expect(extractTicketIdFromQrPayload("{ticket")).toBe("");
  });

  it("creates and hashes scanner tokens without leaking raw tokens", () => {
    const token = generateOpaqueToken(18);
    const hash = hashOpaqueToken(token);

    expect(token).toBeTypeOf("string");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(constantTimeEqual(hash, hashOpaqueToken(` ${token} `))).toBe(true);
    expect(constantTimeEqual(hash, hashOpaqueToken("different"))).toBe(false);
  });

  it("normalizes EVM tx signatures but preserves Solana signatures", () => {
    expect(normalizeTxSignature("0xABCDEF", 1)).toBe("0xabcdef");
    expect(normalizeTxSignature("0xABCDEF", 11155111)).toBe("0xabcdef");
    expect(normalizeTxSignature("5VfYsABC", 101)).toBe("5VfYsABC");
  });

  it("computes scanner link expiry from event date and grace minutes", () => {
    const expiresAt = getScannerLinkExpiry({
      ticket: {
        event_date: "2026-05-18T10:00:00.000Z",
        scan_grace_minutes: 90,
      },
    });

    expect(expiresAt.toISOString()).toBe("2026-05-18T11:30:00.000Z");
  });

  it("reports inactive scanner-link reasons", () => {
    expect(scannerLinkInactiveReason(null)).toBe("not_found");
    expect(scannerLinkInactiveReason({ revoked_at: new Date() })).toBe("revoked");
    expect(
      scannerLinkInactiveReason(
        { expires_at: "2026-05-18T10:00:00.000Z" },
        "2026-05-18T10:00:00.000Z",
      ),
    ).toBe("expired");
    expect(
      scannerLinkInactiveReason(
        { expires_at: "2026-05-18T10:01:00.000Z" },
        "2026-05-18T10:00:00.000Z",
      ),
    ).toBe("");
  });

  it("builds portable ticket records", () => {
    const ticket = buildTicketRecord({
      collection: {
        _id: "collection-1",
        chain_id: 1,
        contract_address: "0xABC",
        token_id: "42",
      },
      communityId: "community-1",
      holderAddress: "0xHolder",
      txSignature: "0xABCDEF",
      index: 2,
      ticketId: "ticket-fixed",
    });

    expect(ticket).toEqual({
      ticket_id: "ticket-fixed",
      community_id: "community-1",
      collection_id: "collection-1",
      holder_address: "0xHolder",
      chain_id: 1,
      contract_address: "0xABC",
      token_id: "42",
      mint_address: null,
      tx_signature: "0xabcdef",
      ticket_index: 2,
      scan_status: "unscanned",
    });
  });

  it("normalizes scan verification result shapes", () => {
    expect(buildScanResult({ ticket: null })).toEqual({
      ok: false,
      reason: "ticket_not_found",
    });
    expect(buildScanResult({ ticket: {}, ownsTicket: false })).toEqual({
      ok: false,
      reason: "ownership_failed",
    });
    expect(
      buildScanResult({
        ticket: { holder_address: "wallet", scanned_at: null },
        ownsTicket: true,
        scan: { scanned_at: "2026-05-18T10:00:00.000Z" },
      }),
    ).toEqual({
      ok: true,
      holder: "wallet",
      scanned: true,
      scanned_at: "2026-05-18T10:00:00.000Z",
    });
  });

  it("throws stable errors for invalid ticket records", () => {
    expect(() => buildTicketRecord({ holderAddress: "wallet" })).toThrow(
      VerifiableTicketingError,
    );
    expect(() => toTicketQrPayload("  ticket  ")).not.toThrow();
  });
});
