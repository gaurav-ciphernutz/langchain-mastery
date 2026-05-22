import { logger } from "@/utils/logger.js";

import { selectTools } from "./tool-selector.js";

export async function toolMiddleware(input: string) {
  const tools = selectTools(input);

  logger.info(
    {
      selectedTools: tools.map((tool) => (tool as { name?: string }).name),
    },
    "Selected runtime tools"
  );

  return tools;
}
