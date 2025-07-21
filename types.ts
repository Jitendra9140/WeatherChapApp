/**
 * Common types used throughout the application
 */

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
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