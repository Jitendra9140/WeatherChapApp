"use client"

import { Bot, User } from "lucide-react"
import { Message } from "@/types"
import MessageParser from "./message-parser"
import { useIsMobile } from "@/hooks/use-mobile"

export const MessageRenderer = ({ message }: { message: Message }) => {
  const { role, content, weatherData } = message
  const isAssistant = role === "assistant"
  const isMobile = useIsMobile()

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-lg ${isMobile ? 'p-3' : 'p-4'} mb-4 ${
          isAssistant ? "bg-primary/10" : "bg-[#003049]"
        } ${isMobile ? 'text-sm' : 'text-base'}`}
      >
        <div className="flex items-start">
          <div className="mr-2 mt-0.5">
            {isAssistant ? (
              <Bot className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-700`} />
            ) : (
              <User className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-700`} />
            )}
          </div>
          <div className="flex-1">
            <MessageParser content={content} weatherData={isAssistant ? weatherData : undefined} />
          </div>
        </div>
      </div>
    </div>
  )
}
