import type { OpsMcpClient } from "./client.js";

type ToolDef = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (client: OpsMcpClient, args: Record<string, unknown>) => Promise<unknown>;
};

/** Write tools that mutate inbox state require confirm=true (server-side gate). */
function withConfirm(args: Record<string, unknown>): Record<string, unknown> {
  return { ...args, confirm: true };
}

export const TOOLS: ToolDef[] = [
  {
    name: "list_stores",
    description: "List connected stores for this merchant tenant.",
    inputSchema: { type: "object", properties: {}, required: [] },
    handler: (c) => c.get("/stores"),
  },
  {
    name: "list_conversations",
    description: "List inbox conversations. Optional filters: storeId, status, limit, cursor.",
    inputSchema: {
      type: "object",
      properties: {
        storeId: { type: "string", description: "Filter by store id" },
        status: { type: "string", description: "Conversation status filter" },
        limit: { type: "number", description: "Page size (default server-side)" },
        cursor: { type: "string", description: "Pagination cursor" },
      },
    },
    handler: (c, a) =>
      c.get("/conversations", {
        storeId: a.storeId as string | undefined,
        status: a.status as string | undefined,
        limit: a.limit as number | undefined,
        cursor: a.cursor as string | undefined,
      }),
  },
  {
    name: "get_conversation",
    description: "Get one conversation detail by id.",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string", description: "Conversation id" },
      },
      required: ["conversationId"],
    },
    handler: (c, a) => c.get(`/conversations/${encodeURIComponent(String(a.conversationId))}`),
  },
  {
    name: "list_messages",
    description: "List messages in a conversation.",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string", description: "Conversation id" },
        limit: { type: "number" },
        cursor: { type: "string" },
      },
      required: ["conversationId"],
    },
    handler: (c, a) =>
      c.get(`/conversations/${encodeURIComponent(String(a.conversationId))}/messages`, {
        limit: a.limit as number | undefined,
        cursor: a.cursor as string | undefined,
      }),
  },
  {
    name: "get_order_context",
    description: "Get order / logistics context linked to a conversation (read-only).",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string", description: "Conversation id" },
      },
      required: ["conversationId"],
    },
    handler: (c, a) =>
      c.get(`/conversations/${encodeURIComponent(String(a.conversationId))}/order-context`),
  },
  {
    name: "list_pending_ai_replies",
    description: "List AI draft replies awaiting human confirm before send.",
    inputSchema: {
      type: "object",
      properties: {
        storeId: { type: "string" },
        limit: { type: "number" },
        cursor: { type: "string" },
      },
    },
    handler: (c, a) =>
      c.get("/pending-ai-replies", {
        storeId: a.storeId as string | undefined,
        limit: a.limit as number | undefined,
        cursor: a.cursor as string | undefined,
      }),
  },
  {
    name: "get_quota",
    description: "Get Ops MCP / external-assistant quota usage for this merchant.",
    inputSchema: { type: "object", properties: {} },
    handler: (c) => c.get("/quota"),
  },
  {
    name: "save_draft",
    description: "Save or update a draft reply on a conversation (does not send).",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        content: { type: "string", description: "Draft body text" },
      },
      required: ["conversationId", "content"],
    },
    handler: (c, a) =>
      c.post(`/conversations/${encodeURIComponent(String(a.conversationId))}/draft`, {
        content: a.content,
      }),
  },
  {
    name: "send_message",
    description:
      "Send a reply on a conversation. Requires confirm=true. Audited on Synerixis. Never auto-sends.",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        content: { type: "string" },
        confirm: {
          type: "boolean",
          description: "Must be true to send",
        },
      },
      required: ["conversationId", "content", "confirm"],
    },
    handler: async (c, a) => {
      if (a.confirm !== true) {
        throw new Error("send_message requires confirm=true (human-in-the-loop).");
      }
      return c.post(
        `/conversations/${encodeURIComponent(String(a.conversationId))}/send`,
        withConfirm({ content: a.content })
      );
    },
  },
  {
    name: "approve_ai_reply",
    description: "Approve a pending AI draft and send it. Requires confirm=true. Audited.",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        draftId: { type: "string", description: "Pending AI draft id if required by API" },
        confirm: { type: "boolean" },
      },
      required: ["conversationId", "confirm"],
    },
    handler: async (c, a) => {
      if (a.confirm !== true) {
        throw new Error("approve_ai_reply requires confirm=true.");
      }
      return c.post(
        `/conversations/${encodeURIComponent(String(a.conversationId))}/approve-ai`,
        withConfirm({ draftId: a.draftId })
      );
    },
  },
  {
    name: "reject_ai_reply",
    description: "Reject a pending AI draft (do not send). Requires confirm=true. Audited.",
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
      if (a.confirm !== true) {
        throw new Error("reject_ai_reply requires confirm=true.");
      }
      return c.post(
        `/conversations/${encodeURIComponent(String(a.conversationId))}/reject-ai`,
        withConfirm({ draftId: a.draftId, reason: a.reason })
      );
    },
  },
  {
    name: "assign_conversation",
    description: "Assign a conversation to an agent/user. Requires confirm=true. Audited.",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        assigneeId: { type: "string" },
        confirm: { type: "boolean" },
      },
      required: ["conversationId", "assigneeId", "confirm"],
    },
    handler: async (c, a) => {
      if (a.confirm !== true) {
        throw new Error("assign_conversation requires confirm=true.");
      }
      return c.post(
        `/conversations/${encodeURIComponent(String(a.conversationId))}/assign`,
        withConfirm({ assigneeId: a.assigneeId })
      );
    },
  },
  {
    name: "update_conversation_status",
    description: "Update conversation status (e.g. open/closed). Requires confirm=true. Audited.",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        status: { type: "string" },
        confirm: { type: "boolean" },
      },
      required: ["conversationId", "status", "confirm"],
    },
    handler: async (c, a) => {
      if (a.confirm !== true) {
        throw new Error("update_conversation_status requires confirm=true.");
      }
      return c.post(
        `/conversations/${encodeURIComponent(String(a.conversationId))}/status`,
        withConfirm({ status: a.status })
      );
    },
  },
];

/** Hard-banned capabilities — never expose as tools. */
export const HARD_BANS = [
  "autosend",
  "auto_send",
  "refund",
  "logistics_write",
  "secrets",
  "credentials",
] as const;
