import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, threadId } = await request.json()

    // Weather Agent API configuration
    const apiUrl = "https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream"

    const requestBody = {
      messages,
      runId: "weatherAgent",
      maxRetries: 2,
      maxSteps: 5,
      temperature: 0.5,
      topP: 1,
      runtimeContext: {},
      threadId: 2,
      resourceId: "weatherAgent",
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        "x-mastra-dev-playground": "true",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`)
    }

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          const decoder = new TextDecoder()
          let buffer = ""
          let cleanedContent = ""

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              // Send any remaining cleaned content
              if (cleanedContent.trim()) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: cleanedContent })}\n\n`))
              }
              controller.close()
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk

            // Process the buffer to extract and clean data
            const lines = buffer.split("\n")
            buffer = lines.pop() || "" // Keep the last incomplete line in buffer

            for (const line of lines) {
              if (line.trim()) {
                try {
                  // Try to parse as JSON first
                  if (line.startsWith("data: ")) {
                    const jsonStr = line.slice(6).trim()
                    if (jsonStr && jsonStr !== "[DONE]") {
                      const parsed = JSON.parse(jsonStr)

                      // Extract content from various possible structures
                      let content = ""
                      if (
                        parsed.choices &&
                        parsed.choices[0] &&
                        parsed.choices[0].delta &&
                        parsed.choices[0].delta.content
                      ) {
                        content = parsed.choices[0].delta.content
                      } else if (parsed.content) {
                        content = parsed.content
                      } else if (parsed.text) {
                        content = parsed.text
                      } else if (typeof parsed === "string") {
                        content = parsed
                      }

                      if (content) {
                        // Filter and clean the content
                        const cleanedChunk = cleanAndFilterContent(content)
                        if (cleanedChunk) {
                          cleanedContent += cleanedChunk
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: cleanedChunk })}\n\n`))
                        }
                      }
                    }
                  } else {
                    // Handle non-JSON lines
                    const cleanedChunk = cleanAndFilterContent(line)
                    if (cleanedChunk) {
                      cleanedContent += cleanedChunk
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: cleanedChunk })}\n\n`))
                    }
                  }
                } catch (e) {
                  // If JSON parsing fails, try to clean the raw line
                  const cleanedChunk = cleanAndFilterContent(line)
                  if (cleanedChunk) {
                    cleanedContent += cleanedChunk
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: cleanedChunk })}\n\n`))
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Weather chat API error:", error)
    return NextResponse.json({ error: "Failed to process weather request" }, { status: 500 })
  }
}

// Function to clean and filter content
function cleanAndFilterContent(content: string): string {
  if (!content || typeof content !== "string") return ""

  // Remove common prefixes and clean the content
  const cleaned = content
    .replace(/^data:\s*/, "") // Remove data: prefix
    .replace(/^\d+:\s*/, "") // Remove number: prefix like "0:", "1:", etc.
    .replace(/^["\s]+|["\s]+$/g, "") // Remove quotes and whitespace from start/end
    .replace(/\\n/g, "\n") // Convert escaped newlines
    .replace(/\\"/g, '"') // Convert escaped quotes
    .trim()

  // Filter out unwanted content
  if (
    !cleaned ||
    cleaned.length < 3 ||
    cleaned.includes("undefined") ||
    cleaned.includes("null") ||
    cleaned.includes("[object Object]") ||
    cleaned.match(/^[\s\n\r]*$/) ||
    cleaned.match(/^[^a-zA-Z]*$/) // Only symbols/numbers
  ) {
    return ""
  }

  // Only return content that seems meaningful
  if (cleaned.match(/[a-zA-Z]/) && cleaned.length > 2) {
    return cleaned + " "
  }

  return ""
}
