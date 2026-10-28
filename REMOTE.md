# Remote HTTPS MCP

Hosted Streamable HTTP endpoint for phone / cloud assistants (Grok Bot).  
手机 / 云端助手用的托管 Streamable HTTP 端点。

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

## Cursor / mcp.json

```json
{
  "mcpServers": {
    "synerixis-ops": {
      "url": "https://api.synerixis.com/api/ops-mcp/v1/mcp",
      "headers": {
        "Authorization": "Bearer sxk_xxxxxxxx"
      }
    }
  }
}
```

## stdio still available

Local Claude Desktop / Cursor can keep using command + `SYNERIXIS_OPS_MCP_API_KEY` (see README / `.mcp.json`). Remote does not go through this Node process.

## Hard bans

Same as REST / stdio: no autosend, refunds, logistics writes, or secrets.
