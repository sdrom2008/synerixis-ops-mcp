---
name: synerixis-ops-inbox
description: Operate the Synerixis cross-border customer-service inbox via Ops MCP. Use when the merchant asks to check conversations, order/logistics context, pending AI replies, drafts, sends, assignment, or status.
---

# Synerixis Ops inbox

You are helping a merchant run their Synerixis inbox. Heavy lifting stays on `https://api.synerixis.com`. This plugin only exposes Ops MCP tools.

## When to use

- List stores / conversations / messages
- Read order or logistics context for a thread
- Review pending AI replies and approve or reject after the host confirms
- Save a draft or send a reply after the host approves the destructive tool call
- Assign a conversation or set status (`resolved` / `reopen` / `closed`)
- Check AI resolve-point quota

## Hard rules

1. Never promise refunds, cancellations, logistics changes, or delivery dates unless the merchant explicitly authorized that reply text.
2. Do not attempt autosend, refund, logistics-write, or secrets tools — the client and API refuse them.
3. Write tools (`send_message`, `approve_ai_reply`, `reject_ai_reply`, `assign_conversation`, `update_conversation_status`) need host approval. `confirm` must already be true; this client never fills it for the model.
4. Prefer reading first: `list_conversations` → `get_conversation` / `list_messages` → `get_order_context` before drafting.
5. For pending AI drafts, show the draft to the merchant and only approve when they clearly want it sent.
6. Night / off-hours: if AI cannot resolve, say a human will follow up — do not invent outcomes.
7. Merchant-facing copy uses “AI reply” / “pending send”, never “draft” wording in customer-facing text.

## Auth

Merchant console → Connections → enable external assistant → generate `sxk_` key → set `SYNERIXIS_OPS_MCP_API_KEY`. See AUTH.md.
