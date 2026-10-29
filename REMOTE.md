# Remote HTTPS MCP (default)

Hosted Streamable HTTP endpoint — **default install path** for Cursor / Grok Bot / Directory.  
手机 / 云端助手默认走这条；本地 stdio 见 `.mcp.stdio.json` 与 README。

## URL

```
https://api.synerixis.com/api/ops-mcp/v1/mcp
```

## Auth

```
Authorization: Bearer sxk_<your-key>
```

Generate the key in the Synerixis merchant console → **Connections**.  
Never put the key in the URL or commit it here.

## Protocol (v1)

- MCP Streamable HTTP (single POST endpoint)
- Response: `application/json` (stateless; no SSE session / `MCP-Session-Id`)
- `GET` / `DELETE` → `405`
- Illegal browser `Origin` → `403`; server-side clients without `Origin` are allowed

## Default Cursor / plugin install

Root `mcp.json` and `.mcp.json` both default to remote. Cursor Plugins substitute `${SYNERIXIS_OPS_MCP_API_KEY}` from the plugin **variables** card (Plugins → Configure). Do not hard-code a real key.

```json
{
  "mcpServers": {
    "synerixis-ops": {
      "url": "https://api.synerixis.com/api/ops-mcp/v1/mcp",
      "headers": {
        "Authorization": "Bearer ${SYNERIXIS_OPS_MCP_API_KEY}"
      }
    }
  }
}
```

Manual `~/.cursor/mcp.json` (non-plugin) can use env interpolation instead:

```json
{
  "mcpServers": {
    "synerixis-ops": {
      "url": "https://api.synerixis.com/api/ops-mcp/v1/mcp",
      "headers": {
        "Authorization": "Bearer ${env:SYNERIXIS_OPS_MCP_API_KEY}"
      }
    }
  }
}
```

Or paste `Bearer sxk_…` once into `headers` (never commit that file).

## Optional stdio fallback

Local Claude Desktop / Cursor can still run the Node shell via `.mcp.stdio.json` (`npx` + `SYNERIXIS_OPS_MCP_API_KEY`). Remote does **not** go through this Node process.

## Hard bans

Same as REST / stdio: no autosend, refunds, logistics writes, or secrets.
