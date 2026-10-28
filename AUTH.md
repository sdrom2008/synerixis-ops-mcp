# Auth / 鉴权


## Grok Bot (beta)

Independent Shopify / Amazon sellers on Synerixis: paste `https://github.com/sdrom2008/synerixis-ops-mcp` into Grok Bot, connect when asked, then fill the secure card with your `sxk_` key. Product is in public testing.

Shopify / Amazon 独立卖家：把仓库地址发给 Grok Bot → 连 MCP → 安全卡填 `sxk_` Key。目前测试中。


## Remote HTTPS MCP (Grok phone / cloud)

Endpoint: `https://api.synerixis.com/api/ops-mcp/v1/mcp`

- Transport: MCP **Streamable HTTP**, v1 **stateless JSON** (no long SSE, no `MCP-Session-Id`)
- Auth: `Authorization: Bearer sxk_…` (also accepts `X-Api-Key`)
- Put the key only in the host secure card / `headers` — never in the URL, chat plaintext, or this repo
- OAuth is **not** required for v1

Cursor example:

```json
{
  "mcpServers": {
    "synerixis-ops": {
      "url": "https://api.synerixis.com/api/ops-mcp/v1/mcp",
      "headers": { "Authorization": "Bearer sxk_xxxxxxxx" }
    }
  }
}
```

stdio (command + `SYNERIXIS_OPS_MCP_API_KEY`) remains supported for local hosts.

## 远程 HTTPS MCP（手机 / 云端 Grok）

端点：`https://api.synerixis.com/api/ops-mcp/v1/mcp`

- 传输：Streamable HTTP；v1 **无状态 JSON**（无长 SSE / Session）
- 鉴权：`Authorization: Bearer sxk_…`（兼容 `X-Api-Key`）
- Key 只进安全卡 / headers；禁止进 URL、聊天明文、本仓
- v1 不做 OAuth

本机仍可用 stdio + 环境变量 `SYNERIXIS_OPS_MCP_API_KEY`。


## English

1. Sign in to the Synerixis merchant console.
2. Open **Connections** (连接 / 外部助手).
3. Ask the platform admin to turn on Ops MCP for the shop if the connect page is hidden.
4. Turn on **Allow external assistant**. While this is off, API keys cannot call tools, and creating or rotating a key is refused. Turning it off revokes live keys.
5. **Generate** an API Key. Plaintext is shown once. It starts with `sxk_`.
6. Configure the MCP client:

   - `SYNERIXIS_OPS_MCP_API_KEY=sxk_...`
   - Optional `SYNERIXIS_OPS_MCP_BASE_URL` (default `https://api.synerixis.com/api/ops-mcp/v1`)

7. Requests use `Authorization: Bearer <key>`.

Writes (`send`, `approve-ai`, `reject-ai`, `assign`, `status`) require `confirm=true`. The stdio client does not fill that in. Marked destructive tools should be approved by the MCP host. Synerixis audits the attempt and the outcome for the merchant and the platform admin.

A platform-admin enter-merchant session cannot change these settings or mint a key.

Never commit keys. Prefer rotating a key after sharing it with a new device.

## 中文

1. 登录 Synerixis 商家台。
2. 打开 **连接**（外部助手）。
3. 若页面不可用，请总后台打开本店 Ops MCP 入口。
4. 打开 **允许外部助手**。关掉时，Key 不能调用工具，也不能新建或轮换；关掉会吊销仍有效的 Key。
5. **生成** API Key。明文只显示一次，前缀是 `sxk_`。
6. 配置 `SYNERIXIS_OPS_MCP_API_KEY`。可选 `SYNERIXIS_OPS_MCP_BASE_URL`（默认生产地址）。
7. 请求头：`Authorization: Bearer <key>`。

发送、批准、驳回、分配、改状态必须带 `confirm=true`。stdio 客户端不会替你填上。宿主应把这些工具当破坏性操作来批准。Synerixis 会记下尝试和结果。

总后台的代登录会话不能改这些设置，也不能签发 Key。

勿把 Key 提交进 Git。换设备后建议轮换 Key。
