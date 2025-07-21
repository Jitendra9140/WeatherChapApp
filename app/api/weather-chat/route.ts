import { type NextRequest, NextResponse } from "next/server"

interface WeatherData {
  temperature?: number
  feelsLike?: number
  humidity?: number
  windSpeed?: number
  windGust?: number
  conditions?: string
  condition?: string // Added for frontend compatibility
  gusts?: number // Added for frontend compatibility
  location?: string
}

interface RequestBody {
  messages: any
  threadId: string
}

const config = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  API_URL: "https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream",
}

const createRequestOptions = (body: RequestBody) => ({
  method: "POST",
  headers: {
    Accept: "*/*",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    "x-mastra-dev-playground": "true",
  },
  body: JSON.stringify({
    ...body,
    runId: "weatherAgent",
    maxRetries: 2,
    maxSteps: 5,
    temperature: 0.5,
    topP: 1,
    runtimeContext: {},
    resourceId: "weatherAgent",
  }),
})

const processWeatherData = (parsed: any): WeatherData => {
  // Log the raw parsed data from the API
  console.log("Raw API Weather Data:", parsed)
  
  // Get the result data from the API
  const result = parsed?.result || {}
  
  // Process and validate the data
  const processedData: WeatherData = {
    ...result,
    // Map field names to match what the frontend expects
    gusts: result.windGust, // Map windGust to gusts for frontend compatibility
    condition: result.conditions, // Map conditions to condition for frontend compatibility
    // Ensure numeric values are valid numbers
    temperature: typeof result.temperature === 'number' && !isNaN(result.temperature) ? result.temperature : 0,
    feelsLike: typeof result.feelsLike === 'number' && !isNaN(result.feelsLike) ? result.feelsLike : 0,
    humidity: typeof result.humidity === 'number' && !isNaN(result.humidity) ? result.humidity : 0,
    windSpeed: typeof result.windSpeed === 'number' && !isNaN(result.windSpeed) ? result.windSpeed : 0
  }
  
  // Log the processed data
  console.log("Processed Weather Data:", processedData)
  
  return processedData
}

const createStreamController = (response: Response) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async start(controller) {
      try {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        let buffer = ""
        const contentChunks: string[] = []
        let weatherData: WeatherData = {}

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            const finalContent = contentChunks.join(" ").trim()
            
            // Create the final response object
            const finalResponse = { content: finalContent, weatherData }
            
            // Log the final response data being sent to the client
            console.log("Final Response Data:", finalResponse)
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(finalResponse)}\n\n`)
            )
            controller.close()
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (/^0:"/.test(trimmed)) {
              const content = trimmed.slice(3, -1)
              content && contentChunks.push(content)
            } else if (trimmed.startsWith("a:{")) {
              try {
                // Log the raw weather data string
                console.log("Raw Weather Data String:", trimmed)
                
                const parsed = JSON.parse(trimmed.slice(2))
                console.log("Parsed Weather JSON:", parsed)
                
                weatherData = processWeatherData(parsed)
                console.log("Processed Weather Data:", weatherData)
              } catch (err) {
                console.warn("Failed to parse weather data:", err)
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
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const response = await fetch(config.API_URL, createRequestOptions(body))

    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`)
    }

    const stream = createStreamController(response)

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Weather chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process weather request" },
      { status: 500 }
    )
  }
}
