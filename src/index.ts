#!/usr/bin/env node
/**
 * Synerixis Ops MCP — lightweight stdio MCP server.
 * Cross-border e-commerce · AI customer-service workbench shell.
 * Talks only to https://api.synerixis.com/api/ops-mcp/v1 — no local DB.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { OpsMcpClient } from "./client.js";
import { HARD_BANS, TOOLS } from "./tools.js";

const apiKey = process.env.SYNERIXIS_OPS_MCP_API_KEY || process.env.SYNERIXIS_API_KEY || "";

const server = new Server(
  {
    name: "synerixis-ops-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  if ((HARD_BANS as readonly string[]).includes(name)) {
    return {
      content: [{ type: "text", text: `Tool "${name}" is hard-banned by Synerixis Ops MCP policy.` }],
      isError: true,
    };
  }

  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const client = new OpsMcpClient(apiKey);
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;
    const result = await tool.handler(client, args);
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: message }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
