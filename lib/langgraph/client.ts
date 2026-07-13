import { Client } from "@langchain/langgraph-sdk"

export const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL || ""

export const LANGGRAPH_ASSISTANT_ID: string = process.env.LANGGRAPH_ASSISTANT_ID || ""

export const langgraphClient = new Client({
    apiUrl: LANGGRAPH_API_URL,
    defaultHeaders: { Authorization: `Bearer ${process.env.LANGGRAPH_SECRET}` }
})
