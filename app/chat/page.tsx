"use client"

import { useRouter } from "next/navigation"
import ChatInterface from "@/components/chat/chat-interface"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthProtection } from "@/hooks/use-auth-protection"
import { Navbar } from "@/components/navbar"

export default function ChatPage() {
  const { user, logout, loading } = useAuth()
  // Use the auth protection hook to redirect if not authenticated
  const { isLoggedIn } = useAuthProtection('/')
  
  // If still loading or not authenticated, show nothing
  if (loading || !isLoggedIn) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Navbar />

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}
