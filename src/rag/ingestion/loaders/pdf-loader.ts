import { readFileSync } from "node:fs";

import { PDFParse } from "pdf-parse";

export async function loadPDF(path: string) {
  const buffer = readFileSync(path);
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });

  try {
    const data = await parser.getText();

    return data.text;
  } finally {
    await parser.destroy();
  }
}
