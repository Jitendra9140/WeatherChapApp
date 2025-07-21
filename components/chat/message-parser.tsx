"use client"

import React from "react"
import WeatherDisplay from "@/components/weather/weather-display"

interface MessageParserProps {
  content: string
  weatherData?: {
    location?: string
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    gusts: number
    condition: string
    time?: string
  }
}

/**
 * MessageParser component displays message content and optional weather data
 */
const MessageParser: React.FC<MessageParserProps> = ({ content, weatherData }) => {
  return (
    <div className="message-content">
      <div className="whitespace-pre-wrap break-words">
        {content}
      </div>

      {weatherData && (
        <div className="mt-4">
          <WeatherDisplay
            data={{
              location: weatherData.location || "Unknown",
              temperature: weatherData.temperature,
              feelsLike: weatherData.feelsLike,
              condition: weatherData.condition,
              humidity: weatherData.humidity,
              windSpeed: weatherData.windSpeed,
              gusts: weatherData.gusts,
              time: weatherData.time || ""
            }}
          />
        </div>
      )}
    </div>
  )
}

export default MessageParser

