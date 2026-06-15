const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL || "http://localhost:8000"

export async function invokeMentor(
  message: string,
  threadId: string,
  problemDescription: string,
  currentPhase: string
) {
  const res = await fetch(`${LANGGRAPH_API_URL}/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: {
        messages: [{ role: "user", content: message }],
        problem_description: problemDescription,
        current_phase: currentPhase,
      },
      config: {
        configurable: { thread_id: threadId },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`LangGraph invoke failed: ${res.statusText}`)
  }

  return res.json()
}

export async function updateStateAndInvoke(
  code: string,
  threadId: string,
  problemDescription: string
) {
  // Step 1: update state with code_submission
  const updateRes = await fetch(`${LANGGRAPH_API_URL}/update_state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      config: { configurable: { thread_id: threadId } },
      values: { code_submission: code },
    }),
  })

  if (!updateRes.ok) {
    throw new Error(`LangGraph update_state failed: ${updateRes.statusText}`)
  }

  // Step 2: invoke to trigger review_node
  const invokeRes = await fetch(`${LANGGRAPH_API_URL}/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: {
        messages: [{ role: "user", content: "submit" }],
        problem_description: problemDescription,
        current_phase: "CODING",
      },
      config: { configurable: { thread_id: threadId } },
    }),
  })

  if (!invokeRes.ok) {
    throw new Error(`LangGraph invoke failed: ${invokeRes.statusText}`)
  }

  return invokeRes.json()
}
