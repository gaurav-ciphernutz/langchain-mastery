import Database from "better-sqlite3";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";

const sqlite = new Database("langgraph.db");

export const checkpointer = new SqliteSaver(sqlite);
