"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Loader2, RefreshCw, Trash2, Cloud } from "lucide-react"
import { MessageRenderer} from "./message-renderer"
import PDFExport from "./pdf-export"
// SuggestedQuestions component removed
import { Message } from "@/types"
import { useIsMobile } from "@/hooks/use-mobile"

export default function ChatInterface() {
  const isMobile = useIsMobile()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // Create and add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError("")

    try {
      const threadId = 2

      const response = await fetch("/api/weather-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content }],
          threadId,
        }),
      })
      
      // Log the request payload
      console.log("Request Payload:", {
        messages: [{ role: "user", content }],
        threadId,
      })
      
      // Log the response object
      console.log("API Response Object:", response)

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          
          // Log the raw chunk data
          console.log("Raw API Chunk:", chunk)
          
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                // Log the complete API response data
                console.log("API Response Data:", data)
                
                if (data.content && typeof data.content === 'string') {
                  assistantContent += data.content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id 
                        ? { 
                            ...msg, 
                            content: assistantContent,
                            weatherData: data.weatherData
                          } 
                        : msg
                    )
                  )
                }
                
                // Log weather data specifically if it exists
                if (data.weatherData) {
                  console.log("Weather Data:", data.weatherData)
                }
              } catch (e) {
                console.warn("Failed to parse streaming data:", e)
              }
            }
          }
        }
      }

      // If no content was received, show an error
      if (!assistantContent.trim()) {
        setError("No response received from the weather service. Please try again.")
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id))
      }
    } catch (err) {
      setError("Failed to send message. Please try again.")
      console.error("Chat error:", err)
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((msg) => msg.role !== "assistant" || msg.content.trim()))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearChat = () => {
    // Clear all messages and reset state
    setMessages([])
    setError("")
    
    // Clear API cache by making a request to clear endpoint
    // This is a no-op for now, but could be implemented if needed
    fetch("/api/weather-chat/clear", { method: "POST" })
      .catch(err => console.log("Failed to clear chat history:", err))
  }

  const retryLastMessage = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")
      if (lastUserMessage) {
        // Remove the last assistant message if it exists and retry
        setMessages((prev) => {
          const lastAssistantIndex = prev.map((m) => m.role).lastIndexOf("assistant")
          if (lastAssistantIndex > -1) {
            return prev.slice(0, lastAssistantIndex)
          }
          return prev
        })
        sendMessage(lastUserMessage.content)
      }
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-2xl w-full space-y-6">
            <Card className="p-4 sm:p-8 text-center">
              <Cloud className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-blue-500 mx-auto mb-4`} />
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-2`}>Welcome to WeatherChat AI</h2>
              <p className={`text-muted-foreground mb-4 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Ask me anything about the weather! I provide clean, human-friendly weather information with detailed
                insights for any location worldwide.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <MessageRenderer message={message} />
              {message.role === "assistant" && message.content.trim() && (
                <div className="flex justify-start ml-8 sm:ml-11">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={() => {
                        console.log("Thumbs up for message:", message.id)
                      }}
                    >
                      <span className="text-xs">👍</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={() => {
                        console.log("Thumbs down for message:", message.id)
                      }}
                    >
                      <span className="text-xs">👎</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={() => {
                        navigator.clipboard.writeText(message.content)
                      }}
                    >
                      <span className="text-xs">📋</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full  flex items-center justify-center">
                  <Cloud className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-gray-500">Getting clean weather data...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={retryLastMessage}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border p-3 sm:p-4">
        <div className="flex items-center space-x-2 mb-2">
          {messages.length > 0 && (
            <>
              <PDFExport messages={messages} />
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="flex items-center space-x-1 bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </Button>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the weather..."
            disabled={isLoading}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-2">{isMobile ? 'Tap send to submit' : 'Press Enter to send, Shift+Enter for new line'}</p>
      </div>
    </div>
  )
}
