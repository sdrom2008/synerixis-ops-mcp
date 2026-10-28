# Synerixis Ops MCP

**跨境电商 · 智能客服工作台**（stdio MCP）

Lightweight remote MCP shell for Synerixis merchant inbox ops.  
极简远程 MCP 壳：不挂本地数据库，不包含 Synerixis 业务源码；所有数据经正式 API。

这个仓库只有 **stdio**。没有 Grok Bot 市场插件包，也没有远程 MCP 传输。

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

### Cursor Directory

Submit / install via [cursor.directory](https://cursor.directory): repo root ships `.mcp.json` and `skills/synerixis-ops-inbox/SKILL.md` for auto-detect. Set `SYNERIXIS_OPS_MCP_API_KEY` after install.

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
| `get_conversation` | Conversation detail |
| `list_messages` | Messages (`limit`, `offset`) |
| `get_order_context` | Order context for this conversation's platform and store |
| `list_pending_ai_replies` | AI drafts awaiting confirm |
| `get_quota` | AI resolve points |
| `save_draft` | Save draft (no send) |
| `send_message` | Send. Host approval + `confirm=true`. Idempotency key. |
| `approve_ai_reply` | Send one AI draft (`draftId` when several exist) |
| `reject_ai_reply` | Discard one AI draft and store `reason` |
| `assign_conversation` | Assign. Body sends `agentId` |
| `update_conversation_status` | `resolved`, `reopen`, or `closed` |

### Auth
See [AUTH.md](./AUTH.md). Keys look like `sxk_` plus hex. This repo never stores tenant secrets.

### License
MIT

---

## 中文

### 这是什么
面向商家的轻量 **stdio MCP**。外部助手可以列会话、看订单、存草稿，并在宿主批准这次工具调用之后发送。

重活仍在正式 API：`https://api.synerixis.com/api/ops-mcp/v1`  
本仓 **无本地数据库**，也没有市场插件清单。

写工具带 `destructiveHint`。本进程不弹出确认框，也不会替模型填上 `confirm`。API 仍拒绝 `confirm` 不是 true 的写操作，并记下审计。

### 本地 stdio
见上方 English。环境变量只用 `SYNERIXIS_OPS_MCP_API_KEY`（`sxk_` 开头）。不要依赖 `SYNERIXIS_API_KEY`。

### 硬禁
客户端会拒绝这些请求，API 对同一路径返回 403：自动发送、退款、物流写入、读取密钥。

### 鉴权
见 [AUTH.md](./AUTH.md)。

### 开源协议
MIT
