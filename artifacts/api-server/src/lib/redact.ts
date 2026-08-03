/**
 * Strips database credentials from any text destined for logs or HTTP
 * responses. Some drivers embed the connection string in error messages, so
 * every error surface (health diagnostics, the final error handler) must run
 * its text through this before emitting it.
 */
export function redactSecrets(input: string): string {
  let out = input;
  const url = process.env.DATABASE_URL;
  if (url) {
    out = out.split(url).join("[DATABASE_URL]");
    try {
      const pw = new URL(url).password;
      if (pw) {
        out = out.split(pw).join("[redacted]");
        const decoded = decodeURIComponent(pw);
        if (decoded && decoded !== pw) {
          out = out.split(decoded).join("[redacted]");
        }
      }
    } catch {
      // DATABASE_URL not URL-parseable; generic pattern below still applies
    }
  }
  // Any postgres URL that slipped into a message via another path.
  out = out.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted-postgres-url]");
  return out;
}
