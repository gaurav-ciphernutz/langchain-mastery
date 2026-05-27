import { createHash } from "node:crypto";

import { Document } from "@langchain/core/documents";
import type { DocumentInterface } from "@langchain/core/documents";
import { ChromaClient, IncludeEnum } from "chromadb";
import type { Metadata } from "chromadb";

import { embeddings } from "../ingestion/embeddings/gemini-embeddings.js";

const COLLECTION_NAME = "lead-knowledge";

type MetadataValue = Metadata[string];

function isPrimitiveMetadataValue(value: unknown): value is MetadataValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    (Array.isArray(value) &&
      value.every(
        (item) =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
      ))
  );
}

function toChromaMetadata(metadata: Record<string, unknown>): Metadata {
  return Object.fromEntries(
    Object.entries(metadata).flatMap(([key, value]) => {
      if (value === undefined) {
        return [];
      }

      if (isPrimitiveMetadataValue(value)) {
        return [[key, value]];
      }

      if (value instanceof Date) {
        return [[key, value.toISOString()]];
      }

      return [[key, JSON.stringify(value)]];
    })
  ) as Metadata;
}

function documentId(document: DocumentInterface, index: number) {
  return createHash("sha256")
    .update(document.pageContent)
    .update(JSON.stringify(document.metadata))
    .update(String(index))
    .digest("hex");
}

class ChromaVectorStore {
  private readonly client = new ChromaClient();

  private async collection() {
    return this.client.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: null,
    });
  }

  async addDocuments(documents: DocumentInterface[]) {
    if (documents.length === 0) {
      return;
    }

    const collection = await this.collection();
    const pageContents = documents.map((document) => document.pageContent);
    const documentEmbeddings = await embeddings.embedDocuments(pageContents);

    await collection.upsert({
      ids: documents.map(
        (document, index) => document.id ?? documentId(document, index)
      ),
      documents: pageContents,
      embeddings: documentEmbeddings,
      metadatas: documents.map((document) =>
        toChromaMetadata(document.metadata)
      ),
    });
  }

  async similaritySearch(query: string, k = 4) {
    const collection = await this.collection();
    const queryEmbedding = await embeddings.embedQuery(query);
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k,
      include: [
        IncludeEnum.documents,
        IncludeEnum.metadatas,
        IncludeEnum.distances,
      ],
    });

    return (results.rows()[0] ?? [])
      .filter((row) => row.document)
      .map(
        (row) =>
          new Document({
            pageContent: row.document ?? "",
            metadata: {
              ...(row.metadata ?? {}),
              distance: row.distance,
            },
            id: row.id,
          })
      );
  }
}

export const vectorStore = new ChromaVectorStore();
