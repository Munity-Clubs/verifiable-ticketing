import crypto from "crypto";

const DEFAULT_GRACE_MINUTES = 24 * 60;

export class VerifiableTicketingError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "VerifiableTicketingError";
  }
}

function fromUrl(text) {
  try {
    const url = new URL(text);
    return (
      url.searchParams.get("ticket") ||
      url.searchParams.get("ticketId") ||
      url.searchParams.get("ticket_id") ||
      ""
    );
  } catch {
    return "";
  }
}

export function extractTicketIdFromQrPayload(payload) {
  const text = String(payload?.ticketId || payload?.ticket_id || payload || "")
    .trim();
  if (!text) return "";

  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      return extractTicketIdFromQrPayload(parsed);
    } catch {
      return "";
    }
  }

  if (/^https?:\/\//i.test(text)) {
    return fromUrl(text).trim();
  }

  return text;
}

export function toTicketQrPayload(ticketId) {
  return String(ticketId || "").trim();
}

export function generateOpaqueToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("base64url");
}

export function hashOpaqueToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token || "").trim())
    .digest("hex");
}

export function constantTimeEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function normalizeTxSignature(txSignature, chainId) {
  const text = String(txSignature || "").trim();
  const numeric = Number(chainId);
  return numeric === 1 || numeric === 11155111 ? text.toLowerCase() : text;
}

export function getCollectionEventDate(collection) {
  const value = collection?.ticket?.event_date ?? collection?.eventDate;
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function getScannerLinkExpiry(collection) {
  const eventDate = getCollectionEventDate(collection);
  if (!eventDate) return null;
  const graceMinutes = Number(
    collection?.ticket?.scan_grace_minutes ?? collection?.scanGraceMinutes,
  );
  const safeGrace =
    Number.isFinite(graceMinutes) && graceMinutes >= 0
      ? graceMinutes
      : DEFAULT_GRACE_MINUTES;
  return new Date(eventDate.getTime() + safeGrace * 60_000);
}

export function scannerLinkInactiveReason(link, now = Date.now()) {
  if (!link) return "not_found";
  if (link.revoked_at || link.revokedAt) return "revoked";
  const expiresAt = link.expires_at ?? link.expiresAt;
  if (expiresAt && new Date(expiresAt).getTime() <= new Date(now).getTime()) {
    return "expired";
  }
  return "";
}

export function buildTicketRecord({
  collection,
  communityId,
  holderAddress,
  txSignature,
  index = 0,
  ticketId = generateOpaqueToken(18),
} = {}) {
  if (!collection || typeof collection !== "object") {
    throw new VerifiableTicketingError(
      "invalid_ticket",
      "collection is required",
    );
  }
  if (!holderAddress) {
    throw new VerifiableTicketingError(
      "invalid_ticket",
      "holderAddress is required",
    );
  }

  const chainId = Number(collection.chain_id ?? collection.chainId);
  return {
    ticket_id: toTicketQrPayload(ticketId),
    community_id: communityId,
    collection_id: collection._id ?? collection.collectionId ?? collection.id,
    holder_address: String(holderAddress),
    chain_id: chainId,
    contract_address: collection.contract_address ?? collection.contractAddress ?? null,
    token_id: collection.token_id ?? collection.tokenId ?? null,
    mint_address: collection.mint_address ?? collection.mintAddress ?? null,
    tx_signature: normalizeTxSignature(txSignature, chainId),
    ticket_index: Math.max(0, Number(index) || 0),
    scan_status: "unscanned",
  };
}

export function buildScanResult({
  ticket,
  ownsTicket,
  scan,
} = {}) {
  if (!ticket) {
    return { ok: false, reason: "ticket_not_found" };
  }
  if (!ownsTicket) {
    return { ok: false, reason: "ownership_failed" };
  }
  return {
    ok: true,
    holder: ticket.holder_address ?? ticket.holderAddress ?? null,
    scanned: Boolean(scan),
    scanned_at: scan?.scanned_at ?? scan?.scannedAt ?? ticket.scanned_at ?? null,
  };
}
