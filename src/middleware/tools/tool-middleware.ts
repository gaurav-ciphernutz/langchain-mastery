import { logger } from "@/utils/logger.js";
import {
  getRuntimeContext,
  runtimeCorrelationFields,
} from "@/runtime/context.js";
import { filterToolsByPermissions } from "@/tools/index.js";

import { selectTools } from "./tool-selector.js";

export async function toolMiddleware(input: string) {
  const runtime = getRuntimeContext();
  const selectedTools = selectTools(input);
  const tools = filterToolsByPermissions(
    selectedTools,
    runtime.permissions,
    { failOpen: true }
  );

  logger.info(
    {
      runtime: runtimeCorrelationFields(runtime),
      selectedTools: tools.map((tool) => (tool as { name?: string }).name),
    },
    "Selected runtime tools"
  );

  return tools;
}
