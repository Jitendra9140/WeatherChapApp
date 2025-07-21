import { NextResponse } from "next/server"

/**
 * API endpoint to clear chat history and cached data
 * This is useful for resetting the chat state when the user clears the chat
 */
export async function POST() {
  try {
    // In a real implementation, this would clear any stored chat history
    // For example, if using a database or session storage
    
    // For now, this is just a placeholder endpoint that returns success
    // Future implementations could:
    // 1. Clear session data
    // 2. Reset thread IDs with the weather service
    // 3. Clear any cached weather data
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing chat history:", error)
    return NextResponse.json({ error: "Failed to clear chat history" }, { status: 500 })
  }
}