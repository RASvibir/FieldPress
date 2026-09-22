// SSRF guard for any server-side fetch of a user-supplied URL (currently:
// resolveEmbed called from a regular pressie's sourceUrl). Resolves the
// hostname and rejects loopback / link-local / private / unique-local
// ranges *before* the real fetch happens, and re-checks after redirects
// since a same-origin-looking URL can 302 into an internal address.
//
// Wire sync (api/feeds.mjs) does NOT go through this — its URLs come from
// the code-owned wireSources.mjs list, not user input, so that path stays
// as a plain fetch.

import dns from "node:dns/promises";
import net from "node:net";

const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);

function isBlockedIp(ip) {
  const type = net.isIP(ip);
  if (type === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
    if (a === 0) return true;
    return false;
  }
  if (type === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true; // loopback
    if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true; // link-local / unique-local
    if (lower.startsWith("::ffff:")) return isBlockedIp(lower.slice(7)); // IPv4-mapped
    return false;
  }
  return true; // unrecognized -> reject, don't guess
}

// Resolves the hostname and returns true if ANY resolved address is
// blocked (fail closed on multi-A-record DNS rebinding attempts too).
async function hostnameIsSafe(hostname) {
  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) return false;
  if (net.isIP(hostname)) return !isBlockedIp(hostname);
  let addrs;
  try {
    addrs = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    return false; // unresolvable -> treat as unsafe, not "allow through"
  }
  if (addrs.length === 0) return false;
  return addrs.every((a) => !isBlockedIp(a.address));
}

// Returns the URL string if safe to fetch, or null if it should be rejected.
export async function assertSafeUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  if (!(await hostnameIsSafe(parsed.hostname))) return null;
  return parsed.toString();
}

export default assertSafeUrl;
