"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChatInterface from "@/components/chat/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export default function ChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    const email = localStorage.getItem("user-email")

    if (!token) {
      router.push("/")
    } else {
      setIsAuthenticated(true)
      setUserEmail(email || "")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-email")
    router.push("/")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-foreground">WeatherChat AI</h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{userEmail}</span>
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}
