---
name: synerixis-ops-connect
description: >-
  Connect Synerixis Ops MCP (remote HTTPS default) with an sxk_ merchant key.
  Use when installing the plugin, adding the MCP URL, filling the secure/variables
  card, fixing 401/403 auth, or the merchant asks how to link Grok/Cursor to Synerixis.
---

# Connect Synerixis Ops MCP

Public beta for independent Shopify / Amazon sellers on Synerixis.

## Default: remote HTTPS (green-dot HTTP)

1. Endpoint: `https://api.synerixis.com/api/ops-mcp/v1/mcp`
2. Auth header: `Authorization: Bearer sxk_…` (also accepts `X-Api-Key`)
3. Install path: cursor.directory plugin / this repo (`mcp.json` already remote) / paste URL into Grok Bot or Cursor MCP settings
4. Key source: Synerixis merchant console → **Connections** → enable **Allow external assistant** → **Generate**. Prefix `sxk_`. Plaintext once.
5. Put the key only in plugin **variables** (`SYNERIXIS_OPS_MCP_API_KEY`), Grok secure card, or headers. Never URL query, chat plaintext, README, or git.
6. v1 is **stateless JSON** (no SSE session / OAuth). Green HTTP status = tools available.

## Smoke after connect

1. Call `get_quota` — expect plan label + **AI解决点** remaining (not 结案).
2. Call `list_stores` — expect connected shops.
3. If both work, hand off to skill `synerixis-ops-inbox` for inbox work.

## Common failures

| Symptom | Likely cause | What to tell the merchant |
|---------|--------------|---------------------------|
| 401 `external_assistant_disabled` | Allow external assistant is off | Turn **Allow external assistant** on. Do not turn it off first — off revokes live keys. Do not regenerate until it is on |
| 401 `ops_mcp_key_invalid` or `ops_mcp_key_revoked` | Bad, missing, or revoked key | Regenerate on Connections and re-paste into the variables card |
| 401 `ops_mcp_disabled_by_admin` | Platform has not opened Ops MCP | Ask Synerixis platform admin to open the entry |
| 403 `SUBSCRIPTION_EXPIRED` | Subscription ended | Renew on /billing. Do not toggle the assistant switch |
| 403 `origin_forbidden` | Browser Origin is not allow-listed | Use the remote server URL (no browser Origin) or an allowed app host |
| Tools missing | Wrong MCP URL / still on old stdio bash entry | Use remote URL above; remove stale local `npx`/bash server |
| Connect page hidden | Shop not enabled for Ops MCP | Ask Synerixis platform admin to open the entry |

Read the JSON `code`. Status alone is not enough.

## Optional stdio

Only if they need a local Node process (e.g. Claude Desktop): copy `.mcp.stdio.json` and replace `sxk_xxxxxxxx`, or run `npx -y github:sdrom2008/synerixis-ops-mcp` with env `SYNERIXIS_OPS_MCP_API_KEY` set to the real key. Do not leave `${SYNERIXIS_OPS_MCP_API_KEY}` in that env block — plugin variables apply only to `mcp.json`. Prefer remote for Grok Bot / Cursor Plugins.

## Hard bans (always)

No autosend, refunds, logistics writes, or secrets — client and API refuse them. Do not offer workarounds.
