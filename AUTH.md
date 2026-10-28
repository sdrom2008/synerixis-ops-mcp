# Auth / 鉴权

## English

1. Sign in to Synerixis merchant console.
2. Open **Connections** (连接 / 外部助手).
3. Enable Ops MCP / external assistant for the tenant (admin may need `opsMcpEnabled`).
4. **Generate** an API Key (you can rotate or revoke later). Plaintext is shown once — store it in your assistant’s secret store or env.
5. Configure the MCP client:

   - Env: `SYNERIXIS_OPS_MCP_API_KEY=sk_ops_...`
   - Optional: `SYNERIXIS_OPS_MCP_BASE_URL` (default `https://api.synerixis.com/api/ops-mcp/v1`)

6. Requests use `Authorization: Bearer <key>`.

Writes (`send`, `approve-ai`, `reject-ai`, `assign`, `status`) require `confirm=true` and are logged to Synerixis audit endpoints for the merchant and platform admin.

Never commit keys. Prefer rotating keys after sharing with a new device.

## 中文

1. 登录 Synerixis 商家台。
2. 打开 **连接**（外部助手）。
3. 开启 Ops MCP / 外部助手（总后台可能需打开 `opsMcpEnabled`）。
4. **生成** API Key（可轮换 / 吊销）；明文只显示一次，请放进 Bot 密钥或环境变量。
5. 配置：

   - `SYNERIXIS_OPS_MCP_API_KEY`
   - 可选 `SYNERIXIS_OPS_MCP_BASE_URL`（默认生产地址如上）

6. 请求头：`Authorization: Bearer <key>`。

发送类写操作必须 `confirm=true`，并在商家连接页与总后台商家详情的审计表中可查。

勿把 Key 提交进 Git。换设备建议轮换 Key。
