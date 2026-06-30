// Shared booking-token signing/verification with versioning + expiration.
// Token format: v{version}.{expEpochSeconds}.{base64url(HMAC-SHA256(secret, `${id}.${exp}`))}
// Multiple secret versions can be active at once so BOOKING_LINK_SECRET can be
// rotated without invalidating reminders that are already in transit.

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

function b64url(bytes: ArrayBuffer): string {
  const b = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(sig).slice(0, 32);
}

function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Active secret versions. The current secret lives in BOOKING_LINK_SECRET
 * (its version number lives in BOOKING_LINK_SECRET_VERSION, default "1").
 * Older still-accepted secrets live in BOOKING_LINK_SECRET_V<n>. To rotate:
 *   1. copy current BOOKING_LINK_SECRET into BOOKING_LINK_SECRET_V<oldN>
 *   2. generate a new BOOKING_LINK_SECRET and bump BOOKING_LINK_SECRET_VERSION
 *   3. once outstanding reminders have expired (14 days), delete the V<oldN> secret
 */
function getActiveSecrets(): Map<number, string> {
  const map = new Map<number, string>();
  const current = Deno.env.get("BOOKING_LINK_SECRET");
  const currentV = Number(Deno.env.get("BOOKING_LINK_SECRET_VERSION") ?? "1");
  if (current) map.set(currentV, current);
  for (let v = 1; v <= 10; v++) {
    const s = Deno.env.get(`BOOKING_LINK_SECRET_V${v}`);
    if (s && !map.has(v)) map.set(v, s);
  }
  return map;
}

export function getCurrentSecretVersion(): number {
  return Number(Deno.env.get("BOOKING_LINK_SECRET_VERSION") ?? "1");
}

export async function signBookingToken(
  bookingId: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<{ token: string; version: number; expiresAt: number }> {
  const secrets = getActiveSecrets();
  const version = getCurrentSecretVersion();
  const secret = secrets.get(version);
  if (!secret) throw new Error("BOOKING_LINK_SECRET not configured for current version");
  const exp = Math.floor(Date.now() / 1000) + Math.max(60, ttlSeconds);
  const sig = await hmac(secret, `${bookingId}.${exp}`);
  return { token: `v${version}.${exp}.${sig}`, version, expiresAt: exp };
}

export type VerifyResult =
  | { ok: true; version: number; expiresAt: number }
  | { ok: false; reason: "malformed" | "expired" | "unknown_version" | "bad_signature" | "missing_secret" };

export async function verifyBookingToken(bookingId: string, token: string): Promise<VerifyResult> {
  // Back-compat: previous tokens were a bare 32-char signature with no version/exp.
  // Accept those if the legacy signature still matches the current secret.
  if (!token.startsWith("v") || !token.includes(".")) {
    const secrets = getActiveSecrets();
    if (!secrets.size) return { ok: false, reason: "missing_secret" };
    for (const [version, secret] of secrets) {
      const key = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(bookingId));
      const legacy = b64url(sig).slice(0, 32);
      if (ctEq(legacy, token)) return { ok: true, version, expiresAt: 0 };
    }
    return { ok: false, reason: "bad_signature" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const version = Number(parts[0].slice(1));
  const exp = Number(parts[1]);
  const sig = parts[2];
  if (!Number.isFinite(version) || !Number.isFinite(exp) || !sig) return { ok: false, reason: "malformed" };
  if (exp < Math.floor(Date.now() / 1000)) return { ok: false, reason: "expired" };

  const secrets = getActiveSecrets();
  const secret = secrets.get(version);
  if (!secret) return { ok: false, reason: "unknown_version" };
  const expected = await hmac(secret, `${bookingId}.${exp}`);
  if (!ctEq(expected, sig)) return { ok: false, reason: "bad_signature" };
  return { ok: true, version, expiresAt: exp };
}
