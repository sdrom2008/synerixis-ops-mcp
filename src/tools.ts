import type { OpsMcpClient } from "./client.js";

type ToolAnnotations = {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
};

type ToolDef = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  annotations?: ToolAnnotations;
  handler: (client: OpsMcpClient, args: Record<string, unknown>) => Promise<unknown>;
};

const READ: ToolAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: true };
const WRITE: ToolAnnotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

function requireConfirm(tool: string, args: Record<string, unknown>): void {
  if (args.confirm !== true) {
    throw new Error(
      `${tool} was not approved. Pass confirm=true only after the host approves this destructive tool call. This client does not set confirm for you.`
    );
  }
}

function callerIdempotencyKey(args: Record<string, unknown>): string | undefined {
  if (args.idempotencyKey == null || args.idempotencyKey === "") return undefined;
  const given = typeof args.idempotencyKey === "string" ? args.idempotencyKey.trim() : "";
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(given)) {
    throw new Error("idempotencyKey must be 8-80 letters, digits, _ or -. Omit it to send without dedupe.");
  }
  return given;
}

function withReplayNote(result: unknown): unknown {
  if (!result || typeof result !== "object" || Array.isArray(result)) return result;
  if ((result as { replay?: unknown }).replay !== true) return result;
  return {
    ...(result as Record<string, unknown>),
    note: "Replay of an earlier send. The platform was not called again because that send already went out.",
  };
}

export const TOOLS: ToolDef[] = [
  {
    name: "list_stores",
    description: "List connected stores for this merchant tenant.",
    annotations: READ,
    inputSchema: { type: "object", properties: {}, required: [] },
    handler: (c) => c.get("/stores"),
  },
  {
    name: "list_conversations",
    description: "List inbox conversations. Optional filters: storeId, status, limit, offset. storeId is a connection id or the store open id. offset is a non-negative page offset.",
    annotations: READ,
    inputSchema: {
      type: "object",
      properties: {
        storeId: { type: "string", description: "Platform connection id, open id, or shop id" },
        status: { type: "string", description: "Session status, or open for not resolved/closed" },
        limit: { type: "number", description: "Page size" },
        offset: { type: "number", description: "Number of rows to skip" },
      },
    },
    handler: (c, a) =>
      c.get("/conversations", {
        storeId: a.storeId as string | undefined,
        status: a.status as string | undefined,
        limit: a.limit as number | undefined,
        offset: a.offset as number | undefined,
      }),
  },
  {
    name: "search_conversations",
    description:
      "Search this merchant's conversations by order number or buyer email (q). Optional storeId/limit/offset. " +
      "按订单号或买家邮箱搜本店会话。Same summary fields as list_conversations; no secrets.",
    annotations: READ,
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Order number or buyer email (also matches customerId/name)" },
        storeId: { type: "string", description: "Platform connection id, open id, or shop id" },
        limit: { type: "number", description: "Page size" },
        offset: { type: "number", description: "Number of rows to skip" },
      },
      required: ["q"],
    },
    handler: (c, a) =>
      c.get("/conversations/search", {
        q: a.q as string,
        storeId: a.storeId as string | undefined,
        limit: a.limit as number | undefined,
        offset: a.offset as number | undefined,
      }),
  },
  {
    name: "get_conversation",
    description: "Get one conversation detail by id.",
    annotations: READ,
    inputSchema: {
      type: "object",
      properties: { conversationId: { type: "string", description: "Conversation id" } },
      required: ["conversationId"],
    },
    handler: (c, a) => c.get(`/conversations/${encodeURIComponent(String(a.conversationId))}`),
  },
  {
    name: "list_messages",
    description: "List messages in a conversation. offset skips from the newest page.",
    annotations: READ,
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
      required: ["conversationId"],
    },
    handler: (c, a) =>
      c.get(`/conversations/${encodeURIComponent(String(a.conversationId))}/messages`, {
        limit: a.limit as number | undefined,
        offset: a.offset as number | undefined,
      }),
  },
  {
    name: "get_order_context",
    description: "Get order / logistics context linked to a conversation (read-only).",
    annotations: READ,
    inputSchema: {
      type: "object",
      properties: { conversationId: { type: "string" } },
      required: ["conversationId"],
    },
    handler: (c, a) => c.get(`/conversations/${encodeURIComponent(String(a.conversationId))}/order-context`),
  },
  {
    name: "list_pending_ai_replies",
    description: "List AI draft replies awaiting confirm before send.",
    annotations: READ,
    inputSchema: {
      type: "object",
      properties: {
        storeId: { type: "string" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
    },
    handler: (c, a) =>
      c.get("/pending-ai-replies", {
        storeId: a.storeId as string | undefined,
        limit: a.limit as number | undefined,
        offset: a.offset as number | undefined,
      }),
  },
  {
    name: "get_quota",
    description: "Get AI resolve-point balance for this merchant.",
    annotations: READ,
    inputSchema: { type: "object", properties: {} },
    handler: (c) => c.get("/quota"),
  },
  {
    name: "get_subscription",
    description:
      "Get this merchant's subscription tier, expiry, AutoSend gate, and billing-portal renew guidance (read-only; no checkout).",
    annotations: READ,
    inputSchema: { type: "object", properties: {} },
    handler: (c) => c.get("/subscription"),
  },
  {
    name: "list_agents",
    description:
      "List this merchant's agents/seats (id, displayName, isActive/isAvailable) for assign_conversation. " +
      "列出本店坐席（id、显示名、是否可用），供分派会话选用。Does not expose secrets or emails.",
    annotations: READ,
    inputSchema: { type: "object", properties: {}, required: [] },
    handler: (c) => c.get("/agents"),
  },
  {
    name: "save_draft",
    description: "Save or update a draft reply on a conversation. Does not send.",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        content: { type: "string", description: "Draft body text" },
      },
      required: ["conversationId", "content"],
    },
    handler: (c, a) =>
      c.post(`/conversations/${encodeURIComponent(String(a.conversationId))}/draft`, { content: a.content }),
  },
  {
    name: "send_message",
    description:
      "Send a reply. Destructive: the host must approve the call. confirm must already be true; this client never sets it. Audited on Synerixis. Same idempotencyKey retries the same send.",
    annotations: WRITE,
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        content: { type: "string" },
        confirm: { type: "boolean", description: "Must already be true. The client does not fill this in." },
        idempotencyKey: { type: "string", description: "Optional retry key, 8-80 letters, digits, _ or -. Invalid keys are rejected. Omit it for a fresh send." },
      },
      required: ["conversationId", "content", "confirm"],
    },
    handler: async (c, a) => {
      requireConfirm("send_message", a);
      const body: Record<string, unknown> = {
        content: a.content,
        confirm: a.confirm,
      };
      const key = callerIdempotencyKey(a);
      if (key) body.idempotencyKey = key;
      return withReplayNote(await c.post(`/conversations/${encodeURIComponent(String(a.conversationId))}/send`, body));
    },
  },
  {
    name: "approve_ai_reply",
    description:
      "Approve one pending AI draft and send it. Pass draftId when more than one draft is waiting. Host must approve. confirm is not set by this client.",
    annotations: WRITE,
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        draftId: { type: "string", description: "Required when several actionable drafts exist" },
        confirm: { type: "boolean" },
        idempotencyKey: { type: "string" },
      },
      required: ["conversationId", "confirm"],
    },
    handler: async (c, a) => {
      requireConfirm("approve_ai_reply", a);
      const body: Record<string, unknown> = {
        draftId: a.draftId,
        confirm: a.confirm,
      };
      const key = callerIdempotencyKey(a);
      if (key) body.idempotencyKey = key;
      return withReplayNote(
        await c.post(`/conversations/${encodeURIComponent(String(a.conversationId))}/approve-ai`, body)
      );
    },
  },
  {
    name: "reject_ai_reply",
    description: "Discard one pending AI draft. Does not discard other drafts. Host must approve. Reason is stored on the audit row.",
    annotations: WRITE,
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        draftId: { type: "string" },
        reason: { type: "string" },
        confirm: { type: "boolean" },
      },
      required: ["conversationId", "confirm"],
    },
    handler: async (c, a) => {
      requireConfirm("reject_ai_reply", a);
      return c.post(`/conversations/${encodeURIComponent(String(a.conversationId))}/reject-ai`, {
        draftId: a.draftId,
        reason: a.reason,
        confirm: a.confirm,
      });
    },
  },
  {
    name: "assign_conversation",
    description:
      "Assign a conversation to an agent. Call list_agents first for assigneeId. " +
      "先 list_agents 取坐席 id。Sends agentId (assigneeId is the same value). Host must approve.",
    annotations: WRITE,
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        assigneeId: { type: "string", description: "Agent id" },
        confirm: { type: "boolean" },
      },
      required: ["conversationId", "assigneeId", "confirm"],
    },
    handler: async (c, a) => {
      requireConfirm("assign_conversation", a);
      const agentId = a.assigneeId;
      return c.post(`/conversations/${encodeURIComponent(String(a.conversationId))}/assign`, {
        agentId,
        assigneeId: agentId,
        confirm: a.confirm,
      });
    },
  },
  {
    name: "update_conversation_status",
    description: "Set conversation status to resolved, reopen, or closed. Host must approve. open is not a write value.",
    annotations: WRITE,
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        status: { type: "string", enum: ["resolved", "reopen", "closed"] },
        confirm: { type: "boolean" },
      },
      required: ["conversationId", "status", "confirm"],
    },
    handler: async (c, a) => {
      requireConfirm("update_conversation_status", a);
      return c.post(`/conversations/${encodeURIComponent(String(a.conversationId))}/status`, {
        status: a.status,
        confirm: a.confirm,
      });
    },
  },
];
