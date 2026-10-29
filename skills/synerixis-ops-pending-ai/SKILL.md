---
name: synerixis-ops-pending-ai
description: >-
  Confirm or discard Synerixis pending AI inbox replies before send. Use when the
  merchant asks about AI drafts, pending sends, list_pending_ai_replies,
  approve_ai_reply, reject_ai_reply, or night/off-hours AI follow-up.
---

# Pending AI replies (confirm before send)

Synerixis may draft AI replies that wait for merchant confirm. Customer-facing words: **AI reply** / **pending send** — not “draft”. Quota language: **AI解决点**, not 结案.

## Flow

1. **List:** `list_pending_ai_replies` (optional `storeId` / `limit` / `offset`).
2. **Show** each pending text to the merchant (and order context via `get_order_context` if useful). Never approve silently.
3. **Approve:** `approve_ai_reply` with `conversationId`, `confirm=true` after host approval. Pass `draftId` when several actionable drafts exist.
4. **Reject:** `reject_ai_reply` with `conversationId`, `confirm=true`, optional `reason` (stored on audit). Does not discard other drafts on the same conversation.
5. **Quota:** after bulk work, `get_quota` to report remaining **AI解决点**.

## Rules

- Host must approve destructive calls; this client never fills `confirm`.
- Never promise refunds, cancellations, logistics changes, or delivery dates unless the merchant authorized that exact reply text.
- Off-hours: if AI cannot resolve, say a human will follow up — do not invent outcomes.
- No autosend path exists; do not invent one.

## Related

Main inbox playbook: skill `synerixis-ops-inbox`. Connect/auth: `synerixis-ops-connect`.
