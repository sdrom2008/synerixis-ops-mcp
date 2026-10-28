/**
 * Thin HTTP client for Synerixis Ops MCP API.
 * No local database — all state lives on api.synerixis.com.
 */

const DEFAULT_BASE = "https://api.synerixis.com/api/ops-mcp/v1";

export class OpsMcpClient {
  readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl = process.env.SYNERIXIS_OPS_MCP_BASE_URL || DEFAULT_BASE) {
    if (!apiKey) {
      throw new Error(
        "Missing SYNERIXIS_OPS_MCP_API_KEY. Generate a Key on Synerixis → Connections, then set the env var."
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: Record<string, unknown> | null,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };
    const init: RequestInit = { method, headers };
    if (body !== undefined && body !== null && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);
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
      throw new Error(`Ops MCP ${method} ${path} → ${res.status}: ${msg}`);
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
