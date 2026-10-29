const DEFAULT_BASE = "https://api.synerixis.com/api/ops-mcp/v1";
const DEFAULT_HOST_SUFFIX = "api.synerixis.com";

const BANNED_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ["POST", "/autosend"],
  ["PUT", "/autosend"],
  ["PATCH", "/autosend"],
  ["POST", "/refund"],
  ["POST", "/orders/refund"],
  ["POST", "/logistics"],
  ["POST", "/shipping/mutate"],
  ["GET", "/secrets"],
  ["GET", "/credentials"],
];

export function redactSecrets(text: string, apiKey?: string): string {
  let out = text ?? "";
  if (apiKey) out = out.split(apiKey).join("[redacted]");
  out = out.replace(/sxk_[A-Za-z0-9]+/g, "sxk_[redacted]");
  out = out.replace(/sk_ops_[A-Za-z0-9]+/g, "sk_ops_[redacted]");
  out = out.replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
  out = out.replace(/Authorization:\s*\S+/gi, "Authorization: [redacted]");
  return out;
}

export function isBannedRequest(method: string, path: string): boolean {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = (path.split("?")[0] ?? "").replace(/\/+$/, "") || "/";
  return BANNED_ROUTES.some(([bannedMethod, bannedPath]) => bannedMethod === normalizedMethod && bannedPath === normalizedPath);
}

/** Suffix must stay under synerixis.com so the API key cannot be sent to an arbitrary host. */
export function allowedHostSuffix(): string {
  const suffix = (process.env.SYNERIXIS_OPS_MCP_ALLOWED_HOST_SUFFIX || DEFAULT_HOST_SUFFIX)
    .trim()
    .toLowerCase()
    .replace(/^\.+/, "")
    .replace(/\.+$/, "");
  if (suffix !== "synerixis.com" && !suffix.endsWith(".synerixis.com")) {
    throw new Error(
      "SYNERIXIS_OPS_MCP_ALLOWED_HOST_SUFFIX must be synerixis.com or a subdomain of synerixis.com."
    );
  }
  return suffix;
}

/** https only, host must be the suffix (default api.synerixis.com) or a subdomain of it. */
export function assertBaseUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("SYNERIXIS_OPS_MCP_BASE_URL is not a valid URL.");
  }
  const host = url.hostname.toLowerCase();
  const suffix = allowedHostSuffix();
  const local =
    process.env.SYNERIXIS_OPS_MCP_ALLOW_INSECURE_LOCAL === "1"
    && (host === "localhost" || host === "127.0.0.1")
    && (url.protocol === "http:" || url.protocol === "https:");
  const allowedHost = host === suffix || host.endsWith(`.${suffix}`);
  if (!local && (url.protocol !== "https:" || !allowedHost)) {
    throw new Error(
      `SYNERIXIS_OPS_MCP_BASE_URL must be https and the host must be ${suffix} or a subdomain of it. For a local API set SYNERIXIS_OPS_MCP_ALLOW_INSECURE_LOCAL=1 and use http://localhost.`
    );
  }
  return url.toString().replace(/\/$/, "");
}

function timeoutMs(method: string, path: string): number {
  const p = path.split("?")[0] ?? "";
  if (method.toUpperCase() === "POST" && (p.endsWith("/send") || p.endsWith("/approve-ai"))) return 45_000;
  return 20_000;
}

export class OpsMcpClient {
  readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl = process.env.SYNERIXIS_OPS_MCP_BASE_URL || DEFAULT_BASE) {
    if (!apiKey) {
      throw new Error(
        "Missing SYNERIXIS_OPS_MCP_API_KEY. Generate a key on Synerixis → Connections, then set that env var."
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = assertBaseUrl(baseUrl);
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: Record<string, unknown> | null,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    if (isBannedRequest(method, path)) {
      throw new Error(
        `Ops MCP refuses ${method.toUpperCase()} ${path}. Autosend, refunds, logistics writes, and secrets are not available.`
      );
    }

    // Join the absolute base and the path, then parse once. Do not use new URL(path, base):
    // a path starting with / would drop the /api/ops-mcp/v1 prefix.
    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };
    const init: RequestInit = {
      method,
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs(method, path)),
    };
    if (body !== undefined && body !== null && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(redactSecrets(`Ops MCP ${method} ${path} failed: ${message}`, this.apiKey));
    }

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!res.ok) {
      const msg =
        typeof data === "object" && data && "message" in data
          ? String((data as { message: unknown }).message)
          : text || res.statusText;
      throw new Error(redactSecrets(`Ops MCP ${method} ${path} → ${res.status}: ${msg}`, this.apiKey));
    }
    return data as T;
  }

  get<T = unknown>(path: string, query?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>("GET", path, null, query);
  }

  post<T = unknown>(path: string, body?: Record<string, unknown>, query?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>("POST", path, body ?? {}, query);
  }

  patch<T = unknown>(path: string, body?: Record<string, unknown>, query?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>("PATCH", path, body ?? {}, query);
  }
}
