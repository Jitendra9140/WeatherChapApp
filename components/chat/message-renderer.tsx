"use client"

import { Bot, User } from "lucide-react"
import WeatherCard from "@/components/weather/weather-card"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  weatherData?: any
}

interface MessageRendererProps {
  message: Message
}

const parseWeatherData = (content: string) => {
  try {
    // Clean the content first
    const cleanedContent = cleanContent(content)

    // Try to extract JSON from cleaned content
    const jsonBlock = extractJsonBlock(cleanedContent)
    if (jsonBlock) {
      try {
        return JSON.parse(jsonBlock)
      } catch {
        // Fall through to text parsing
      }
    }

    // Parse from natural language text
    return parseFromText(cleanedContent)
  } catch (error) {
    console.error("Error parsing weather data:", error)
    return null
  }
}

const cleanContent = (content: string): string => {
  if (!content) return ""

  return content
    .replace(/^0:\s*/, "") // Remove "0:" prefix
    .replace(/^\d+:\s*/gm, "") // Remove any number: prefix from lines
    .replace(/data:\s*/g, "") // Remove data: prefix
    .replace(/\\n/g, "\n") // Convert escaped newlines
    .replace(/\\"/g, '"') // Convert escaped quotes
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
}

const extractJsonBlock = (text: string): string | null => {
  const start = text.indexOf("{")
  if (start === -1) return null

  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++
    else if (text[i] === "}") depth--

    if (depth === 0) {
      return text.slice(start, i + 1)
    }
  }
  return null
}

const parseFromText = (content: string) => {
  const weatherData: any = {}
  const lines = content.split(/[.\n]/).filter((line) => line.trim().length > 0)

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase().trim()

    // Extract location with better patterns
    const locationPatterns = [
      /(?:weather in|in|for)\s+([a-zA-Z\s,]+?)(?:\s+is|\s+:|,|\s+the|\s+today|\s+currently)/i,
      /^([a-zA-Z\s,]+?)\s+(?:weather|temperature|conditions|forecast)/i,
      /current weather (?:in|for)\s+([a-zA-Z\s,]+)/i,
    ]

    for (const pattern of locationPatterns) {
      const match = line.match(pattern)
      if (match && !weatherData.location) {
        weatherData.location = match[1].trim().replace(/^the\s+/i, "")
        break
      }
    }

    // Extract temperature with better patterns
    const tempPatterns = [
      /(?:temperature|temp).*?(-?\d+(?:\.\d+)?)\s*°?[cf]/i,
      /(-?\d+(?:\.\d+)?)\s*°[cf]/i,
      /is\s+(-?\d+(?:\.\d+)?)\s*degrees/i,
    ]

    for (const pattern of tempPatterns) {
      const match = line.match(pattern)
      if (match && !weatherData.temperature) {
        weatherData.temperature = Number.parseFloat(match[1])
        break
      }
    }

    // Extract feels like temperature
    const feelsLikeMatch = line.match(/feels?\s+like\s+(-?\d+(?:\.\d+)?)\s*°?[cf]/i)
    if (feelsLikeMatch) {
      weatherData.feelsLike = Number.parseFloat(feelsLikeMatch[1])
    }

    // Extract humidity
    const humidityMatch = line.match(/humidity.*?(\d+)\s*%/i)
    if (humidityMatch) {
      weatherData.humidity = Number.parseInt(humidityMatch[1])
    }

    // Extract wind speed
    const windMatch = line.match(/wind.*?(\d+(?:\.\d+)?)\s*(?:km\/h|mph|m\/s)/i)
    if (windMatch) {
      weatherData.windSpeed = Number.parseFloat(windMatch[1])
    }

    // Extract gusts
    const gustsMatch = line.match(/gusts?.*?(\d+(?:\.\d+)?)\s*(?:km\/h|mph|m\/s)/i)
    if (gustsMatch) {
      weatherData.gusts = Number.parseFloat(gustsMatch[1])
    }

    // Extract pressure
    const pressureMatch = line.match(/pressure.*?(\d+(?:\.\d+)?)\s*(?:hpa|mb|mbar)/i)
    if (pressureMatch) {
      weatherData.pressure = Number.parseFloat(pressureMatch[1])
    }

    // Extract visibility
    const visibilityMatch = line.match(/visibility.*?(\d+(?:\.\d+)?)\s*(?:km|miles?)/i)
    if (visibilityMatch) {
      weatherData.visibility = Number.parseFloat(visibilityMatch[1])
    }

    // Extract weather conditions with better patterns
    const conditionPatterns = [
      { pattern: /(?:slight|light)?\s*rain\s*showers?/i, condition: "Light Rain Showers" },
      { pattern: /(?:heavy)?\s*rain/i, condition: "Rain" },
      { pattern: /(?:partly|mostly)?\s*cloudy/i, condition: "Cloudy" },
      { pattern: /(?:clear|sunny)/i, condition: "Sunny" },
      { pattern: /(?:snow|snowing)/i, condition: "Snow" },
      { pattern: /(?:storm|thunderstorm)/i, condition: "Thunderstorm" },
      { pattern: /(?:fog|foggy)/i, condition: "Foggy" },
      { pattern: /(?:overcast)/i, condition: "Overcast" },
    ]

    for (const { pattern, condition } of conditionPatterns) {
      if (pattern.test(line) && !weatherData.condition) {
        weatherData.condition = condition
        break
      }
    }
  })

  // Only return weather data if we found meaningful information
  return Object.keys(weatherData).length > 1 ? weatherData : null
}

export default function MessageRenderer({ message }: MessageRendererProps) {
  // Clean the message content before processing
  const cleanedContent = message.role === "assistant" ? cleanContent(message.content) : message.content
  const weatherData = message.role === "assistant" ? parseWeatherData(cleanedContent) : null
  const hasWeatherData = weatherData && Object.keys(weatherData).length > 1

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] ${
          message.role === "user" ? "flex-row-reverse" : "flex-row"
        } items-start space-x-3`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.role === "user" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div className="space-y-3">
          {/* Weather Card for assistant messages with weather data */}
          {hasWeatherData && message.role === "assistant" && <WeatherCard data={weatherData} />}

          {/* Regular message content - show cleaned content */}
          <div
            className={`rounded-lg px-4 py-2 ${
              message.role === "user" ? "bg-blue-500 text-white" : "bg-card border border-border"
            }`}
          >
            <p className="whitespace-pre-wrap">{cleanedContent}</p>
            <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-muted-foreground"}`}>
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
