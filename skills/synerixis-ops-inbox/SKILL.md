---
name: synerixis-ops-inbox
description: Operate the Synerixis cross-border customer-service inbox via Ops MCP. For independent Shopify/Amazon sellers on Synerixis (public beta). Use when connecting from a GitHub repo URL, filling the secure API-key card, or helping with inbox/order/send flows.
---

# Synerixis Ops inbox (beta)

Public beta for **independent Shopify and Amazon sellers** on Synerixis. Still testing — tell the merchant features may change; feedback goes to support@synerixis.com.

## Connect (Grok Bot / Cursor) — remote HTTPS default

1. Preferred: add MCP URL `https://api.synerixis.com/api/ops-mcp/v1/mcp`, or install this repo / Directory plugin (root `mcp.json` already points there — HTTP green-dot, not local `npx`/bash).
2. Secure card / plugin variable: paste `sxk_` key from Synerixis → **Connections** (external assistant must be on). Never put the key in the URL or chat plaintext.
3. After connect, use Ops MCP tools only (never invent refunds, logistics writes, or secrets). Optional local stdio is `.mcp.stdio.json` only.

## Tool inventory (names must match)

| Tool | Use |
|------|-----|
| `list_stores` | Connected stores |
| `list_conversations` | Inbox page (`storeId`, `status`, `limit`, `offset`) |
| `search_conversations` | Find sessions by **order number** or **buyer email** (`q`; optional `storeId`/`limit`/`offset`) |
| `get_conversation` | One conversation summary + pending AI draft |
| `list_messages` | Message thread |
| `get_order_context` | Orders/logistics context for that conversation |
| `list_pending_ai_replies` | AI replies awaiting merchant confirm |
| `get_quota` | AI resolve-point balance |
| `list_agents` | Seats (id, display name, available) — **call before** `assign_conversation` |
| `save_draft` | Save reply text (no send) |
| `send_message` | Send after host approval + `confirm=true` |
| `approve_ai_reply` / `reject_ai_reply` | Confirm or discard one pending AI reply |
| `assign_conversation` | Assign to `agentId` from `list_agents` |
| `update_conversation_status` | `resolved` / `reopen` / `closed` |

## Playbook (read → draft → write)

1. **Find the session**: `search_conversations` when the merchant gives an order# or buyer email; otherwise `list_conversations` (optionally filter `storeId` / `status`).
2. **Read**: `get_conversation` → `list_messages` → `get_order_context` (and `list_pending_ai_replies` / `get_quota` when relevant).
3. **Draft**: `save_draft` with merchant-approved wording; or surface a pending AI reply for approve/reject.
4. **Assign** (if needed): `list_agents` first, then `assign_conversation` with that seat’s id.
5. **Send / status**: `send_message` or `approve_ai_reply` only after host approval (`confirm` already true); then `update_conversation_status` when closing out.

## Hard rules

1. Never promise refunds, cancellations, logistics changes, or delivery dates unless the merchant explicitly authorized that reply text.
2. No autosend, refund, logistics-write, or secrets — client and API refuse them.
3. Write tools need host approval; `confirm` must already be true (client never fills it).
4. Read first: search/list → messages → order context → then draft/send.
5. Show pending AI drafts to the merchant before approve.
6. Off-hours: if AI cannot resolve, say a human will follow up — do not invent outcomes.
7. Customer-facing copy: “AI reply” / “pending send”, not “draft”.
8. Assign only with an `agentId` from a fresh `list_agents` result for this shop.
