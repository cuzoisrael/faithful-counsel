/**
 * Cloudflare Worker — 301 redirect old hostnames → https://iacpd.org
 *
 * Behavior:
 *  - Forces HTTPS (any HTTP request is upgraded via 301).
 *  - Canonicalizes www.iacpd.org → iacpd.org (apex preferred).
 *  - Redirects any legacy hostname (see OLD_HOSTS) to https://iacpd.org.
 *  - Preserves the full path + query string.
 *  - Adds HSTS on every redirect response (max-age 2 years, includeSubDomains, preload).
 *
 * Deployment:
 *  1. Create a Worker in the Cloudflare dashboard for the OLD domain's zone
 *     (or wrangler deploy with routes = ["oldhost.com/*", "www.oldhost.com/*"]).
 *  2. Add a Route on each legacy zone: `*<oldhost>/*` -> this Worker.
 *  3. Keep DNS for the old hostnames pointing to Cloudflare (proxied / orange-cloud).
 *  4. For iacpd.org itself, set the canonical (apex vs www) inside the Lovable
 *     Domains panel — Lovable handles the www<->apex 301 at the edge automatically.
 */

const CANONICAL_ORIGIN = "https://iacpd.org";

// Add every legacy hostname you want redirected. Include www + apex variants.
const OLD_HOSTS = new Set([
  "iacpd.lovable.app",
  "www.iacpd.lovable.app",
  "www.iacpd.org", // safety net if Lovable's www→apex rule is ever off
  // "old-domain.com",
  // "www.old-domain.com",
]);

const HSTS = "max-age=63072000; includeSubDomains; preload";

export default {
  /**
   * @param {Request} request
   */
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    const shouldRedirect =
      url.protocol === "http:" || OLD_HOSTS.has(host) || host === "www.iacpd.org";

    if (!shouldRedirect) {
      // Not our concern — pass through (Worker shouldn't normally be on iacpd.org apex).
      return fetch(request);
    }

    const target = `${CANONICAL_ORIGIN}${url.pathname}${url.search}`;
    return new Response(null, {
      status: 301,
      headers: {
        Location: target,
        "Strict-Transport-Security": HSTS,
        "Cache-Control": "public, max-age=3600",
        "X-Redirected-By": "iacpd-canonical-worker",
      },
    });
  },
};
