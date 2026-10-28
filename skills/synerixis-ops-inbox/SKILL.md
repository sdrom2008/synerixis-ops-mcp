---
name: synerixis-ops-inbox
description: Operate the Synerixis cross-border customer-service inbox via Ops MCP. For independent Shopify/Amazon sellers on Synerixis (public beta). Use when connecting from a GitHub repo URL, filling the secure API-key card, or helping with inbox/order/send flows.
---

# Synerixis Ops inbox (beta)

Public beta for **independent Shopify and Amazon sellers** on Synerixis. Still testing — tell the merchant features may change; feedback goes to support@synerixis.com.

## Connect (Grok Bot)

1. Merchant pastes `https://github.com/sdrom2008/synerixis-ops-mcp` into Grok Bot and asks to connect Synerixis Ops MCP from that repo.
2. Bot shows a secure card — merchant pastes `sxk_` key from Synerixis → **Connections** (external assistant must be on).
3. After connect, use Ops MCP tools only.

## When to use tools

- List stores / conversations / messages
- Read order or logistics context
- Review pending AI replies; approve or reject only after the host confirms
- Save a draft or send after host approval on destructive calls
- Search by order number or buyer email (`search_conversations`)
- List agents (`list_agents`) then assign, or set status (`resolved` / `reopen` / `closed`)
- Check AI resolve-point quota

## Hard rules

1. Never promise refunds, cancellations, logistics changes, or delivery dates unless the merchant explicitly authorized that reply text.
2. No autosend, refund, logistics-write, or secrets — client and API refuse them.
3. Write tools need host approval; `confirm` must already be true (client never fills it).
4. Read first: conversations → messages → order context → then draft/send.
5. Show pending AI drafts to the merchant before approve.
6. Off-hours: if AI cannot resolve, say a human will follow up — do not invent outcomes.
7. Customer-facing copy: “AI reply” / “pending send”, not “draft”.
