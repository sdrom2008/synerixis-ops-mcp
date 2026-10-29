# Synerixis Ops MCP — Product

**What this is / 这是什么**

A thin [MCP](https://modelcontextprotocol.io) surface for Synerixis merchant **unified inbox** ops. External assistants (Grok Bot, Cursor, Claude Desktop) list stores and conversations, read order context, save drafts, confirm pending AI replies, and send — **only after the host approves** write tools.

跨境卖家统一收件箱的轻量 MCP 壳。助手可列店铺/会话、看订单、存草稿、确认待发 AI 回复并发送；写操作必须经宿主批准。重活在正式 API，本仓无本地数据库。

**Audience (public beta):** independent **Shopify / Amazon** sellers on Synerixis. Still testing — feedback: support@synerixis.com.

**Default transport:** remote HTTPS  
`https://api.synerixis.com/api/ops-mcp/v1/mcp` + `Authorization: Bearer sxk_…`  
(stdio / `npx` is optional — see `.mcp.stdio.json`.)

**Quota language:** balance is **AI resolve points / AI解决点** (`get_quota`). Do not call them 结案.

**Hard bans (API 403):** autosend, refunds, logistics writes, secrets/credentials. Never invent those outcomes for the merchant.

**Subscription:** `get_subscription` is read-only (tier, expiry, renew portal). It does not create a checkout. Meta personal-assistant channel is still out (P1).

**Docs for agents:** install this plugin → load skill `synerixis-ops-inbox` (plus connect / pending-AI skills). Humans: [USAGE.md](./USAGE.md), [AUTH.md](./AUTH.md), [REMOTE.md](./REMOTE.md).
