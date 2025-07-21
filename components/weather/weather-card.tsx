"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sun,  Cloud,
  CloudRain,  CloudSnow,
  CloudLightning,  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  MapPin,
} from "lucide-react"

interface WeatherData {
  location?: string
  temperature?: number
  condition?: string
  humidity?: number
  windSpeed?: number
  pressure?: number
  visibility?: number
  uvIndex?: number
  sunrise?: string
  sunset?: string
  forecast?: Array<{
    day: string
    high: number
    low: number
    condition: string
  }>
  feelsLike?: number
  gusts?: number
}

interface WeatherCardProps {
  data: WeatherData
}

const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase()

  if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
    return <Sun className="h-8 w-8 text-yellow-500" />
  } else if (lowerCondition.includes("cloud")) {
    return <Cloud className="h-8 w-8 text-gray-500" />
  } else if (lowerCondition.includes("rain") || lowerCondition.includes("shower")) {
    return <CloudRain className="h-8 w-8 text-blue-500" />
  } else if (lowerCondition.includes("snow")) {
    return <CloudSnow className="h-8 w-8 text-blue-200" />
  } else if (lowerCondition.includes("storm") || lowerCondition.includes("thunder")) {
    return <CloudLightning className="h-8 w-8 text-purple-500" />
  } else {
    return <Sun className="h-8 w-8 text-yellow-500" />
  }
}

const getSmallWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase()

  if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
    return <Sun className="h-4 w-4 text-yellow-500" />
  } else if (lowerCondition.includes("cloud")) {
    return <Cloud className="h-4 w-4 text-gray-500" />
  } else if (lowerCondition.includes("rain")) {
    return <CloudRain className="h-4 w-4 text-blue-500" />
  } else if (lowerCondition.includes("snow")) {
    return <CloudSnow className="h-4 w-4 text-blue-200" />
  } else {
    return <Sun className="h-4 w-4 text-yellow-500" />
  }
}

export default function WeatherCard({ data }: WeatherCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground line-clamp-1">
              {data.location || "Weather Update"}
            </CardTitle>
            {data.location && (
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                Current Location
              </div>
            )}
          </div>
          {data.condition && getWeatherIcon(data.condition)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {/* Main Temperature */}
        {data.temperature && (
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground">
              {Math.round(data.temperature)}°C
            </div>
            {data.condition && (
              <Badge 
                variant="secondary" 
                className="mt-1 sm:mt-2 bg-blue-100/90 dark:bg-blue-900/90 text-blue-800 dark:text-blue-200 backdrop-blur-sm"
              >
                {data.condition}
              </Badge>
            )}
          </div>
        )}

        {/* Feels Like Temperature */}
        {data.feelsLike && data.feelsLike !== data.temperature && (
          <div className="text-center">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Feels like <span className="font-semibold text-base sm:text-lg">{Math.round(data.feelsLike)}°C</span>
            </div>
          </div>
        )}

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {data.humidity && (
            <div className="flex items-center space-x-2 p-1.5 sm:p-2 bg-muted/50 rounded-lg hover:bg-muted/60 transition-colors">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-muted-foreground">Humidity</div>
                <div className="font-semibold text-foreground">{data.humidity}%</div>
              </div>
            </div>
          )}

          {data.windSpeed && (
            <div className="flex items-center space-x-2 p-1.5 sm:p-2 bg-muted/50 rounded-lg hover:bg-muted/60 transition-colors">
              <Wind className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-xs text-muted-foreground">Wind</div>
                <div className="font-semibold text-foreground">
                  {data.windSpeed} km/h
                  {data.gusts && data.gusts > data.windSpeed && (
                    <span className="text-xs text-muted-foreground block">Gusts: {data.gusts} km/h</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {data.pressure && (
            <div className="flex items-center space-x-2 p-1.5 sm:p-2 bg-muted/50 rounded-lg hover:bg-muted/60 transition-colors">
              <Gauge className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-xs text-muted-foreground">Pressure</div>
                <div className="font-semibold text-foreground">{data.pressure} hPa</div>
              </div>
            </div>
          )}

          {data.visibility && (
            <div className="flex items-center space-x-2 p-1.5 sm:p-2 bg-muted/50 rounded-lg hover:bg-muted/60 transition-colors">
              <Eye className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-xs text-muted-foreground">Visibility</div>
                <div className="font-semibold text-foreground">{data.visibility} km</div>
              </div>
            </div>
          )}
        </div>

        {/* Sun Times - Made more compact on mobile */}
        {(data.sunrise || data.sunset) && (
          <div className="flex justify-between items-center p-2 sm:p-3 bg-muted/30 rounded-lg">
            {data.sunrise && (
              <div className="flex items-center space-x-2">
                <Sunrise className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Sunrise</div>
                  <div className="font-semibold text-foreground">{data.sunrise}</div>
                </div>
              </div>
            )}
            {data.sunset && (
              <div className="flex items-center space-x-2">
                <Sunset className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Sunset</div>
                  <div className="font-semibold text-foreground">{data.sunset}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Forecast - Limited to 3 days on mobile */}
        {data.forecast && data.forecast.length > 0 && (
          <div className="space-y-1.5 sm:space-y-2">
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Forecast</h4>
            <div className="space-y-1.5 sm:space-y-2">
              {data.forecast.slice(0, 3).map((day, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-1.5 sm:p-2 bg-muted/50 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  {getSmallWeatherIcon(day.condition)}
                  <span className="text-sm font-medium text-foreground">{day.day}</span>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-foreground">{Math.round(day.high)}°</span>
                    <span className="text-muted-foreground">{Math.round(day.low)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}