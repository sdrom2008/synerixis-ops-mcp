# Synerixis Ops MCP

**跨境电商 · 智能客服工作台**（默认远程 HTTPS MCP）

Lightweight MCP shell for Synerixis merchant inbox ops.  
极简 MCP 壳：不挂本地数据库，不包含 Synerixis 业务源码；所有数据经正式 API。

**Default install = remote HTTPS** → `https://api.synerixis.com/api/ops-mcp/v1/mcp`（Shopify 同款绿点 HTTP）。  
本仓仍提供可选 **stdio**（`.mcp.stdio.json` / `npx`）给本机 Claude Desktop。

---

## English

### What this is
A thin [Model Context Protocol](https://modelcontextprotocol.io) surface that lets an external assistant list conversations, read order context, save drafts, and send replies **after the host approves the tool call**.

Heavy lifting stays on the Synerixis API:

`https://api.synerixis.com/api/ops-mcp/v1`

Write tools are marked `destructiveHint`. The host must approve destructive calls. The Synerixis API still rejects a write unless `confirm` is true, and it writes an audit row for the attempt and the result.

### What this is not
- Not the Synerixis main product repo
- No local DB / Redis / queue
- No marketplace plugin install (Directory listing is separate)
- No autosend, refunds, logistics writes, or secrets. The API returns 403 for those routes.

### Who this is for (beta)

Independent Shopify sellers and Amazon sellers running customer support through Synerixis. **Public beta — still testing.** Expect rough edges; feedback: support@synerixis.com.

### Install (recommended) — remote HTTPS

Root `mcp.json` / `.mcp.json` already default to remote. After install, fill the `sxk_` key (plugin **variables** card, Grok secure card, or headers).

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

1. Generate a key in Synerixis merchant console → **Connections** → enable external assistant → **Generate** (`sxk_`…).
2. Install from [cursor.directory](https://cursor.directory/plugins/synerixis-ops-mcp), this GitHub repo, or paste the URL into Grok Bot / Cursor MCP settings.
3. Set `SYNERIXIS_OPS_MCP_API_KEY` (or paste `Bearer sxk_…` into headers). Never commit a real key.
4. Connected HTTP transport shows a green status light (same class as Shopify’s remote MCP).

Auth: `Authorization: Bearer sxk_…` (or `X-Api-Key`). v1 is **stateless JSON** (no SSE session).  
Do **not** put the key in the URL or in this repo.

Manual Cursor user config can use `${env:SYNERIXIS_OPS_MCP_API_KEY}` instead of the plugin `${SYNERIXIS_OPS_MCP_API_KEY}` placeholder. See [REMOTE.md](./REMOTE.md) and [AUTH.md](./AUTH.md).

### Optional: stdio (local Claude Desktop / Cursor)

Only if you need a local Node process. Copy [`.mcp.stdio.json`](./.mcp.stdio.json) or:

```bash
npx -y github:sdrom2008/synerixis-ops-mcp
```

```json
{
  "mcpServers": {
    "synerixis-ops": {
      "command": "npx",
      "args": ["-y", "github:sdrom2008/synerixis-ops-mcp"],
      "env": {
        "SYNERIXIS_OPS_MCP_API_KEY": "sxk_xxxxxxxx"
      }
    }
  }
}
```

Or clone + `npm install` + `npm run build` and point `command` at `dist/index.js`.

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
面向商家的轻量 MCP（**默认远程 HTTPS**，可选 stdio）。外部助手可以列会话、看订单、存草稿，并在宿主批准这次工具调用之后发送。

重活仍在正式 API：`https://api.synerixis.com/api/ops-mcp/v1`  
本仓 **无本地数据库**；默认装法连 `api.synerixis.com` 的 Streamable HTTP，不跑本机 Node。

写工具带 `destructiveHint`。宿主须批准破坏性调用。API 仍拒绝 `confirm` 不是 true 的写操作，并记下审计。

### 给谁用（内测）

面向用 Synerixis 做客服的 **Shopify / Amazon 独立卖家**。**目前测试中**，功能还在打磨；问题请发 support@synerixis.com。

### 安装（推荐）— 远程 HTTPS

根目录 `mcp.json` / `.mcp.json` 已默认远程。装完后填 `sxk_` Key（插件变量卡 / Grok 安全卡 / headers）。

1. 商家台 **连接** 页打开「允许外部助手」并 **生成** Key。
2. 从 [cursor.directory](https://cursor.directory/plugins/synerixis-ops-mcp)、本仓库或 Grok Bot / Cursor MCP 设置安装。
3. 填入 `SYNERIXIS_OPS_MCP_API_KEY`（或 `Bearer sxk_…`）。**禁止**把真实 Key 提交进 Git。
4. HTTP 连上后状态灯为绿色（与 Shopify 远程 MCP 同类）。

鉴权：`Authorization: Bearer sxk_…`。v1 **无状态 JSON**（无 SSE Session）。  
详见 [REMOTE.md](./REMOTE.md)、[AUTH.md](./AUTH.md)。

### 可选：本地 stdio
见上方 English，或复制 [`.mcp.stdio.json`](./.mcp.stdio.json)。环境变量只用 `SYNERIXIS_OPS_MCP_API_KEY`（`sxk_` 开头）。

### 硬禁
API 对这些路径返回 403：自动发送、退款、物流写入、读取密钥。

### 鉴权
见 [AUTH.md](./AUTH.md)。

### 开源协议
MIT
