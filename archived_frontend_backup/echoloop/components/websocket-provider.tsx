"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface WebSocketContextType {
  isConnected: boolean
  sendMessage: (message: any) => void
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  sendMessage: () => {},
})

export const useWebSocket = () => useContext(WebSocketContext)

interface WebSocketProviderProps {
  url: string
  children: React.ReactNode
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (data: any) => void
}

export function WebSocketProvider({ url, children, onConnect, onDisconnect, onMessage }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Connect to real WebSocket server
    try {
      console.log("Connecting to WebSocket:", url)
      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log("WebSocket connection established")
        setIsConnected(true)
        onConnect?.()
      }

      ws.onmessage = (event) => {
        console.log("WebSocket message received:", event.data)
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onclose = () => {
        console.log("WebSocket connection closed")
        setIsConnected(false)
        onDisconnect?.()
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      setSocket(ws)

      // Cleanup function
      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close()
        }
      }
    } catch (error) {
      console.error("Error setting up WebSocket:", error)
      
      // Fallback to simulated connection if real connection fails
      console.log("Falling back to simulated WebSocket connection")
      setIsConnected(true)
      onConnect?.()

      // Simulate receiving a message after 5 seconds
      const timeoutId = setTimeout(() => {
        if (onMessage) {
          onMessage({
            id: "new-email-123",
            sender: "marketing@company.com",
            subject: "New Product Announcement",
            timestamp: new Date().toISOString(),
            summary: [
              "Introducing our new AI-powered analytics platform",
              "Early access available for premium customers",
              "50% discount for the first 3 months",
            ],
          })
        }
      }, 5000)

      return () => {
        clearTimeout(timeoutId)
        setIsConnected(false)
        onDisconnect?.()
      }
    }
  }, [url, onConnect, onDisconnect, onMessage])

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    } else {
      console.log("Cannot send message, WebSocket not connected")
    }
  }

  return <WebSocketContext.Provider value={{ isConnected, sendMessage }}>{children}</WebSocketContext.Provider>
}
