"use client"
import { Card } from "@/components/ui/card"
import { MapPin, Calendar, Thermometer, CloudRain } from "lucide-react"

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void
}

const suggestedQuestions = [
  {
    icon: <MapPin className="h-4 w-4" />,
    text: "What's the weather in London?",
    category: "Current Weather",
  },
  {
    icon: <Calendar className="h-4 w-4" />,
    text: "Will it rain tomorrow in New York?",
    category: "Forecast",
  },
  {
    icon: <Thermometer className="h-4 w-4" />,
    text: "What's the temperature in Tokyo?",
    category: "Temperature",
  },
  {
    icon: <CloudRain className="h-4 w-4" />,
    text: "Weather forecast for this weekend",
    category: "Extended Forecast",
  },
]

export default function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested Questions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestedQuestions.map((question, index) => (
          <Card
            key={index}
            className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-dashed"
            onClick={() => onQuestionClick(question.text)}
          >
            <div className="flex items-start space-x-2">
              <div className="text-blue-500 mt-0.5">{question.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{question.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{question.category}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
