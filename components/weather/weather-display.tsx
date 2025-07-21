"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Droplets,
  MapPin,
  ThermometerSun,
  Wind,
} from "lucide-react"
import { motion } from "framer-motion"
import { WeatherIcon } from "./weather-icons"
import { formatTemperature, formatWindSpeed } from "@/lib/weather-formatter"

interface WeatherData {
  location: string
  temperature: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  gusts: number
  time?: string
}

interface WeatherDisplayProps {
  data: WeatherData
  showActions?: boolean
  units?: {
    temperature: "C" | "F"
    windSpeed: "kmh" | "mph"
  }
}

// Animation variants for elements
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export default function WeatherDisplay({ 
  data, 
  showActions = false,
  units = { temperature: "C", windSpeed: "kmh" }
}: WeatherDisplayProps) {
  // Format temperature values directly from API data
  const formattedTemp = formatTemperature(data.temperature, units.temperature)
  const formattedFeelsLike = formatTemperature(data.feelsLike, units.temperature)
  const showFeelsLike = Math.round(data.temperature) !== Math.round(data.feelsLike)

  // Format wind speeds directly from API data
  const windSpeed = formatWindSpeed(data.windSpeed, units.windSpeed)
  const gustSpeed = formatWindSpeed(data.gusts, units.windSpeed)
  const showGusts = data.gusts > data.windSpeed

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm" // Reduced from max-w-md to max-w-sm
    >
      <Card className="overflow-hidden border border-border bg-card shadow-sm dark:shadow-md dark:shadow-primary/5">
        <CardContent className="p-0">
          {/* Header with location and current time */}
          <motion.div 
            variants={itemVariants}
            className="bg-primary/10 dark:bg-primary/20 p-2 sm:p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-medium text-foreground">{data.location}</h3>
              </div>
              {data.time && (
                <span className="text-xs text-muted-foreground">{data.time}</span>
              )}
            </div>
          </motion.div>

          {/* Main weather display */}
          <div className="p-2 sm:p-3">
            <motion.div 
              variants={itemVariants}
              className="mb-4 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span 
                  className="text-2xl font-bold text-foreground" 
                  aria-label={`${formattedTemp} temperature`}
                >
                  {formattedTemp}
                </span>
                {showFeelsLike && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ThermometerSun className="h-3 w-3" aria-hidden="true" />
                    <span>Feels like {formattedFeelsLike}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                <WeatherIcon condition={data.condition} className="h-12 w-12"  />
                <Badge variant="outline" className="mt-1 bg-primary/5 dark:bg-primary/20 dark:text-primary">
                  {data.condition}
                </Badge>
              </div>
            </motion.div>

            {/* Weather details */}
            <div className="grid grid-cols-2 gap-2">
              <motion.div 
                variants={itemVariants}
                className="flex items-center gap-1.5 rounded-lg bg-muted/50 dark:bg-muted/30 p-2 dark:border dark:border-muted/20"
              >
                <Droplets className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                <div>
                  <div className="text-xs text-muted-foreground">Humidity</div>
                  <div className="font-medium">{data.humidity}%</div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="flex items-center gap-1.5 rounded-lg bg-muted/50 dark:bg-muted/30 p-2 dark:border dark:border-muted/20"
              >
                <Wind className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <div>
                  <div className="text-xs text-muted-foreground">Wind</div>
                  <div className="font-medium">
                    {windSpeed}
                    {showGusts && (
                      <span className="block text-xs text-muted-foreground">
                        Gusts: {gustSpeed}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action buttons */}
            {showActions && (
              <motion.div 
                variants={itemVariants}
                className="mt-4 flex justify-end space-x-2"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-transparent px-3 text-sm font-medium text-muted-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Dislike this weather forecast"
                >
                  👎
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-transparent px-3 text-sm font-medium text-muted-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Like this weather forecast"
                >
                  👍
                </motion.button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}