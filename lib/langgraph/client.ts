import { Client } from "@langchain/langgraph-sdk"

export const LANGGRAPH_API_URL =
  process.env.LANGGRAPH_API_URL || "http://localhost:2024"

export const LANGGRAPH_ASSISTANT_ID =
  process.env.LANGGRAPH_ASSISTANT_ID || "agent"

export const langgraphClient = new Client({ apiUrl: LANGGRAPH_API_URL })
