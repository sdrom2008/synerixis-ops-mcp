# Synerixis Ops MCP

**跨境电商 · 智能客服工作台**（stdio MCP）

Lightweight remote MCP shell for Synerixis merchant inbox ops.  
极简远程 MCP 壳：不挂本地数据库，不包含 Synerixis 业务源码；所有数据经正式 API。

本仓继续提供 **stdio**（本机 Claude Desktop / Cursor）。手机 / 云端 Grok Bot 请用远程 HTTPS MCP（见下方），不必跑本进程。

---

## English

### What this is
A thin [Model Context Protocol](https://modelcontextprotocol.io) server that lets an external assistant list conversations, read order context, save drafts, and send replies **after the host approves the tool call**.

Heavy lifting stays on the Synerixis API:

`https://api.synerixis.com/api/ops-mcp/v1`

Write tools are marked `destructiveHint`. This process does not open a confirm dialog and does not set `confirm` for the model. The Synerixis API still rejects a write unless `confirm` is true, and it writes an audit row for the attempt and the result.

### What this is not
- Not the Synerixis main product repo
- No local DB / Redis / queue
- No marketplace plugin install
- No autosend, refunds, logistics writes, or secrets. The client refuses those HTTP paths, and the API returns 403 for the same routes.

### Who this is for (beta)

Independent Shopify sellers and Amazon sellers running customer support through Synerixis. **Public beta — still testing.** Expect rough edges; feedback: support@synerixis.com.

### How to use with Grok Bot (recommended) — remote HTTPS

Phone / cloud Grok Bot cannot reach localhost stdio. Use the hosted Streamable HTTP endpoint:

1. In Grok Bot: **Add this MCP server** → URL  
   `https://api.synerixis.com/api/ops-mcp/v1/mcp`
2. When the secure card appears, paste your `sxk_` API Key  
   (Synerixis merchant console → **Connections** → enable external assistant → Generate).
3. Done — the Bot can list inbox threads, read order context, and send only after you approve destructive tool calls.

Auth: `Authorization: Bearer sxk_…` (or `X-Api-Key`). v1 is **stateless JSON** (no SSE session).  
Do **not** put the key in the URL or in this repo.

Cursor / desktop remote example (`mcp.json`):

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

stdio (below) still works for Claude Desktop / local Cursor.  
Listed on [cursor.directory](https://cursor.directory). Root ships `.mcp.json` (stdio) + `skills/synerixis-ops-inbox/SKILL.md`. See also [REMOTE.md](./REMOTE.md) and [AUTH.md](./AUTH.md).

### stdio (Claude Desktop / Cursor / any MCP host)

```bash
git clone https://github.com/sdrom2008/synerixis-ops-mcp.git
cd synerixis-ops-mcp
npm install
npm run build
```

```json
{
  "mcpServers": {
    "synerixis-ops": {
      "command": "node",
      "args": ["/absolute/path/to/synerixis-ops-mcp/dist/index.js"],
      "env": {
        "SYNERIXIS_OPS_MCP_API_KEY": "sxk_xxxxxxxx"
      }
    }
  }
}
```

The process reads only `SYNERIXIS_OPS_MCP_API_KEY`. It does not fall back to `SYNERIXIS_API_KEY`.  
Optional `SYNERIXIS_OPS_MCP_BASE_URL` must be `https` on `api.synerixis.com`. A local API needs `SYNERIXIS_OPS_MCP_ALLOW_INSECURE_LOCAL=1` and `http://localhost` or `http://127.0.0.1`.

### Tools
| Tool | Purpose |
|------|---------|
| `list_stores` | Connected stores |
| `list_conversations` | Inbox list (`storeId`, `status`, `limit`, `offset`) |
| `search_conversations` | Search by order number or buyer email (`q`, optional `storeId`/`limit`/`offset`) |
| `get_conversation` | Conversation detail |
| `list_messages` | Messages (`limit`, `offset`) |
| `get_order_context` | Order context for this conversation's platform and store |
| `list_pending_ai_replies` | AI drafts awaiting confirm |
| `get_quota` | AI resolve points |
| `list_agents` | Agents/seats (id, display name, available) for assign |
| `save_draft` | Save draft (no send) |
| `send_message` | Send. Host approval + `confirm=true`. Idempotency key. |
| `approve_ai_reply` | Send one AI draft (`draftId` when several exist) |
| `reject_ai_reply` | Discard one AI draft and store `reason` |
| `assign_conversation` | Assign. Body sends `agentId` |
| `update_conversation_status` | `resolved`, `reopen`, or `closed` |

**Suggested flow:** `search_conversations` or `list_conversations` → `list_messages` / `get_order_context` → `save_draft`; call `list_agents` before `assign_conversation`.

### Auth
See [AUTH.md](./AUTH.md). Keys look like `sxk_` plus hex. This repo never stores tenant secrets.

### License
MIT

---

## 中文

### 这是什么
面向商家的轻量 MCP（**stdio + 远程 HTTPS**）。外部助手可以列会话、看订单、存草稿，并在宿主批准这次工具调用之后发送。

重活仍在正式 API：`https://api.synerixis.com/api/ops-mcp/v1`  
本仓 **无本地数据库**；远程协议面在 `api.synerixis.com`，本仓仍提供 stdio 壳与文档。

写工具带 `destructiveHint`。本进程不弹出确认框，也不会替模型填上 `confirm`。API 仍拒绝 `confirm` 不是 true 的写操作，并记下审计。

### 给谁用（内测）

面向用 Synerixis 做客服的 **Shopify / Amazon 独立卖家**。**目前测试中**，功能还在打磨；问题请发 support@synerixis.com。

### 在 Grok Bot 里怎么用（推荐）— 远程 HTTPS

手机 / 云端 Grok 到不了本机 stdio，请用托管 Streamable HTTP：

1. Grok Bot：**添加 MCP 服务器** → URL  
   `https://api.synerixis.com/api/ops-mcp/v1/mcp`
2. 安全卡填入商家台 **连接** 页生成的 `sxk_` Key（先打开「允许外部助手」）。
3. 连上后即可看收件箱、订单上下文；发送类操作须你在宿主侧批准。

鉴权：`Authorization: Bearer sxk_…`。v1 **无状态 JSON**（无 SSE Session）。  
**禁止**把 Key 写进 URL 或本仓。stdio 装法见上方 English，仍保留给本机宿主。详见 [REMOTE.md](./REMOTE.md)、[AUTH.md](./AUTH.md)。

### 本地 stdio
见上方 English。环境变量只用 `SYNERIXIS_OPS_MCP_API_KEY`（`sxk_` 开头）。不要依赖 `SYNERIXIS_API_KEY`。

### 硬禁
客户端会拒绝这些请求，API 对同一路径返回 403：自动发送、退款、物流写入、读取密钥。

### 鉴权
见 [AUTH.md](./AUTH.md)。

### 开源协议
MIT
