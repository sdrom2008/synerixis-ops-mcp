# Synerixis Ops MCP — Usage

Short path for merchants and for Grok Bot. Prefer the Cursor skills under `skills/` — Grok loads them with the plugin and should not need a long onboarding essay.

## 1. Connect (once)

1. Merchant console → **Connections** → turn on **Allow external assistant** → **Generate** key (`sxk_…`). Plaintext shown once.
2. Install from [cursor.directory](https://cursor.directory/plugins/synerixis-ops-mcp) or this repo. Root `mcp.json` already points at remote HTTPS.
3. Paste the key into the plugin **variables** / Grok secure card (`SYNERIXIS_OPS_MCP_API_KEY`). Never put the key in the URL, chat, or git.
4. Green HTTP status = tools live. Optional local stdio: copy `.mcp.stdio.json`.

Skill: `synerixis-ops-connect`.

## 2. Everyday inbox

| Goal | Tools |
|------|--------|
| Stores | `list_stores` |
| Inbox page | `list_conversations` (`storeId` / `status` / `limit` / `offset`) |
| Find by order# or buyer email | `search_conversations` (`q`) |
| Thread + order | `get_conversation` → `list_messages` → `get_order_context` |
| AI解决点 balance | `get_quota` |
| Pending AI replies | `list_pending_ai_replies` → show merchant → `approve_ai_reply` / `reject_ai_reply` |
| Draft (no send) | `save_draft` |
| Send | `send_message` after host approval + `confirm=true` |
| Assign | `list_agents` first → `assign_conversation` |
| Status | `update_conversation_status` (`resolved` / `reopen` / `closed`) |

Skill: `synerixis-ops-inbox` (main playbook). Pending-AI detail: `synerixis-ops-pending-ai`.

## 3. Hard rules

- No autosend / refund / logistics write / secrets.
- Never promise refunds, cancellations, logistics changes, or delivery dates unless the merchant authorized that exact reply text.
- Write tools need host approval; client never fills `confirm`.
- Customer-facing copy: “AI reply” / “pending send”, not “draft”. Quota = **AI解决点**, not 结案.
- Off-hours: if AI cannot finish, say a human will follow up — do not invent outcomes.

## 4. Subscription (placeholder)

When subscription tools land on the API, call them before pitching upgrades or explaining plan limits. Until then: use `get_quota` for **AI解决点** remaining; for billing/plan questions point the merchant to [app.synerixis.com](https://app.synerixis.com) or support@synerixis.com — do not invent plan names or prices.

## 5. More detail

- Product overview: [PRODUCT.md](./PRODUCT.md)
- Auth: [AUTH.md](./AUTH.md)
- Remote protocol: [REMOTE.md](./REMOTE.md)
- Full README: [README.md](./README.md)
