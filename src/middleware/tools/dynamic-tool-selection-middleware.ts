import type { BaseMessage } from "@langchain/core/messages";
import type { ClientTool, ServerTool } from "@langchain/core/tools";
import { createMiddleware } from "langchain";

import {
  getRuntimeContext,
  runtimeCorrelationFields,
} from "@/runtime/context.js";
import { getToolDescriptor } from "@/tools/index.js";
import { logger } from "@/utils/logger.js";

type ToolLike = ClientTool | ServerTool;

export interface ToolSelectionRule {
  toolNames: string[];
  keywords: string[];
}

export interface DynamicToolSelectionMiddlewareOptions {
  rules: ToolSelectionRule[];
  alwaysInclude?: string[];
  maxTools?: number;
  failOpen?: boolean;
}

function contentToText(content: BaseMessage["content"]): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") {
          return block;
        }

        if (
          typeof block === "object" &&
          block !== null &&
          "text" in block &&
          typeof block.text === "string"
        ) {
          return block.text;
        }

        return JSON.stringify(block);
      })
      .join("\n");
  }

  return JSON.stringify(content) ?? "";
}

function getLatestHumanMessageText(messages: BaseMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.getType() === "human") {
      return contentToText(message.content).toLowerCase();
    }
  }

  return "";
}

function getToolName(tool: ToolLike) {
  const name = (tool as { name?: unknown }).name;

  return typeof name === "string" ? name : undefined;
}

function createToolLookup(tools: ToolLike[]) {
  return new Map(
    tools.flatMap((tool) => {
      const name = getToolName(tool);

      return name ? [[name, tool] as const] : [];
    })
  );
}

function selectToolNames(
  requestText: string,
  options: DynamicToolSelectionMiddlewareOptions
) {
  const selectedToolNames = new Set(options.alwaysInclude ?? []);

  for (const rule of options.rules) {
    const matchesRule = rule.keywords.some((keyword) =>
      requestText.includes(keyword.toLowerCase())
    );

    if (!matchesRule) {
      continue;
    }

    for (const toolName of rule.toolNames) {
      selectedToolNames.add(toolName);
    }
  }

  return [...selectedToolNames];
}

function selectTools(
  tools: ToolLike[],
  selectedToolNames: string[],
  options: DynamicToolSelectionMiddlewareOptions
) {
  const toolLookup = createToolLookup(tools);
  const alwaysInclude = new Set(options.alwaysInclude ?? []);
  const selectedTools: ToolLike[] = [];

  for (const toolName of selectedToolNames) {
    const tool = toolLookup.get(toolName);

    if (!tool) {
      continue;
    }

    if (
      options.maxTools !== undefined &&
      selectedTools.length >= options.maxTools &&
      !alwaysInclude.has(toolName)
    ) {
      continue;
    }

    selectedTools.push(tool);
  }

  if (selectedTools.length === 0 && options.failOpen !== false) {
    return tools;
  }

  return selectedTools;
}

export function createDynamicToolSelectionMiddleware(
  options: DynamicToolSelectionMiddlewareOptions
) {
  return createMiddleware({
    name: "dynamicToolSelectionMiddleware",

    wrapModelCall: async (request, handler) => {
      const runtime = getRuntimeContext();
      const requestText = getLatestHumanMessageText(request.messages);
      const selectedToolNames = selectToolNames(requestText, options);
      const tools = selectTools(request.tools, selectedToolNames, options);
      const selectedToolPolicies = tools.flatMap((tool) => {
        const name = getToolName(tool);
        const descriptor = name ? getToolDescriptor(name) : undefined;

        return name && descriptor
          ? [
              {
                name,
                category: descriptor.category,
                policy: descriptor.policy,
              },
            ]
          : [];
      });

      logger.info(
        {
          runtime: runtimeCorrelationFields(runtime),
          availableToolCount: request.tools.length,
          selectedTools: tools.map(getToolName).filter(Boolean),
          selectedToolPolicies,
        },
        "Selected tools for model call"
      );

      return handler({
        ...request,
        tools,
      });
    },
  });
}
