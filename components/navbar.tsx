"use client"

import * as React from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/AuthContext"

interface NavbarProps {
  title?: string
}

export function Navbar({ title = "WeatherChat AI" }: NavbarProps) {
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex  items-center space-x-3">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
          <h1 className={`font-semibold text-foreground ${isMobile ? 'text-lg' : 'text-xl'}`}>{title}</h1>
        </div>

        {/* Desktop menu */}
        {!isMobile && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="mt-3 py-2 border-t border-border">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground py-2">
              <User className="h-3 w-3" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-1 bg-transparent text-xs"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}