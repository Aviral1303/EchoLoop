"use client"

import * as React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface WebSocketContextType {
  isConnected: boolean
  messages: any[]
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  messages: [],
})

export const useWebSocket = () => useContext(WebSocketContext)

interface WebSocketProviderProps {
  children: React.ReactNode
  url?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (data: any) => void
}

export function WebSocketProvider({
  children,
  url = "ws://localhost:8080/api/v1/ws",
  onConnect,
  onDisconnect,
  onMessage,
}: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [isSimulated, setIsSimulated] = useState(true)
  const [connectionError, setConnectionError] = useState(false)

  useEffect(() => {
    // For development, use a simulated connection
    const simulateWebSocket = () => {
      console.log("Using simulated WebSocket connection");
      setIsConnected(true);
      onConnect?.();
      
      // Simulate receiving messages occasionally
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          const mockMessage = {
            type: "email_received",
            sender: "team@example.com",
            subject: "Weekly Update",
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, mockMessage]);
          onMessage?.(mockMessage);
        }
      }, 30000);
      
      return () => clearInterval(interval);
    };
    
    // Return the simulated connection
    return simulateWebSocket();
    
  }, [url, onConnect, onDisconnect, onMessage]);

  return (
    <WebSocketContext.Provider value={{ isConnected, messages }}>
      {children}
    </WebSocketContext.Provider>
  )
}
