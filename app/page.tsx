"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Cloud, Sun, CloudRain } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()

  // Redirect to chat if already logged in
  useEffect(() => {
    if (isLoggedIn && !loading) {
      // Use window.location.href for more reliable redirection
      window.location.href = "/chat";
    }
  }, [isLoggedIn, loading])

  if (loading || isLoggedIn) {
    return null // Will redirect to chat or is still loading
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-2 mb-4">
            <Cloud className="h-8 w-8 text-blue-500" />
            <Sun className="h-8 w-8 text-yellow-500" />
            <CloudRain className="h-8 w-8 text-gray-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            WeatherChat AI
          </h1>
          <p className="text-muted-foreground">Your intelligent weather companion powered by AI</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-card border shadow-xl">
          <CardContent className="p-6">
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={isLogin ? "default" : "ghost"}
                className="flex-1 rounded-md"
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                className="flex-1 rounded-md"
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Button>
            </div>

            {isLogin ? (
              <LoginForm onSuccess={() => router.push("/chat")} />
            ) : (
              <SignupForm onSuccess={() => setIsLogin(true)} />
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground">Real-time Weather</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <Sun className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">AI Powered</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
              <CloudRain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground">Smart Forecasts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
