# Synerixis Ops MCP

**跨境电商 · 智能客服工作台**（Grok Bot / Claude Desktop / Cursor）

Lightweight remote MCP shell for Synerixis merchant inbox ops.  
极简远程 MCP 壳：不挂本地数据库，不包含 Synerixis 业务源码；所有数据经正式 API。

---

## English

### What this is
A thin [Model Context Protocol](https://modelcontextprotocol.io) server that lets an external assistant (e.g. **Grok Bot** on phone or desktop) list conversations, read order context, save drafts, and **confirm-to-send** replies against your Synerixis tenant.

Heavy lifting stays on Synerixis production API:

`https://api.synerixis.com/api/ops-mcp/v1`

### What this is not
- Not the Synerixis main product repo
- No local DB / Redis / queue
- No autosend, refunds, logistics writes, or secrets tooling (hard-banned)

### Install (Grok Bot / market plugin)
1. In Synerixis merchant console → **Connections**, generate an **Ops MCP API Key**, enable external assistant, optionally pause native auto-send.
2. In Grok Bot → **Connect apps** (phone or desktop), install this marketplace plugin / MCP.
3. Paste the merchant Key when prompted (or set `SYNERIXIS_OPS_MCP_API_KEY`).
4. Chat: ask the bot to list pending AI replies or send a confirmed reply.

### Local / Claude Desktop / Cursor (stdio)

```bash
git clone https://github.com/sdrom2008/synerixis-ops-mcp.git
cd synerixis-ops-mcp
npm install
npm run build
```

Example MCP config:

```json
{
  "mcpServers": {
    "synerixis-ops": {
      "command": "node",
      "args": ["/absolute/path/to/synerixis-ops-mcp/dist/index.js"],
      "env": {
        "SYNERIXIS_OPS_MCP_API_KEY": "sk_ops_xxxxxxxx"
      }
    }
  }
}
```

Or: `npx -y tsx src/index.ts` with the same env.

### Tools
| Tool | Purpose |
|------|---------|
| `list_stores` | Connected stores |
| `list_conversations` | Inbox list |
| `get_conversation` | Conversation detail |
| `list_messages` | Messages |
| `get_order_context` | Order context (read-only) |
| `list_pending_ai_replies` | AI drafts awaiting confirm |
| `get_quota` | Quota usage |
| `save_draft` | Save draft (no send) |
| `send_message` | Send — requires `confirm=true` |
| `approve_ai_reply` | Approve AI draft — `confirm=true` |
| `reject_ai_reply` | Reject AI draft — `confirm=true` |
| `assign_conversation` | Assign — `confirm=true` |
| `update_conversation_status` | Status change — `confirm=true` |

Write actions are audited in Synerixis (merchant Connections + admin seller detail).

### Auth
See [AUTH.md](./AUTH.md). Key is created in Synerixis UI; this repo never stores tenant secrets.

### License
MIT

---

## 中文

### 这是什么
面向商家的轻量 **MCP** 壳，让外部助手（如手机 / 电脑上的 **Grok Bot**）对接 Synerixis 收件箱：列会话、看订单上下文、存草稿、**一句话确认后再发送**。

重活仍在正式 API：`https://api.synerixis.com/api/ops-mcp/v1`  
本仓 **无本地数据库**、不包含运营台私有业务源码。

### 市场钩子
- 标题示例：`Synerixis — 跨境电商智能客服工作台（Grok Bot）`
- 卖点：多店收件箱、待确认 AI 回复、确认后发送、写操作可审计

### 安装（Grok Bot）
1. Synerixis 商家台 → **连接**，生成 Ops MCP API Key，打开外部助手；可按需暂停原生自动发送。
2. 在 Grok Bot「连接应用」里安装本市场插件（手机 / 电脑同一套）。
3. 填入商家 Key。
4. 对话里即可查待确认、确认发送。

### 本地 stdio
见上方 English「Local」一节；环境变量 `SYNERIXIS_OPS_MCP_API_KEY`。

### 硬禁
不提供：自动发送、退款、物流写操作、密钥/凭证读取。

### 鉴权
见 [AUTH.md](./AUTH.md)。

### 开源协议
MIT
