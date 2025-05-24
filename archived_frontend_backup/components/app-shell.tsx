"use client"

import React, { useState, useEffect } from "react"
import { Loader2, Mail, Wifi, WifiOff } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/user-nav"
import { WebSocketProvider } from "@/components/websocket-provider"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // WebSocket event handlers
  const handleConnect = () => {
    setIsConnected(true)
    toast.success("Connected to server")
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    toast.error("Disconnected from server")
  }

  const handleMessage = (data: any) => {
    try {
      if (data.type === "new_email") {
        toast(
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <div>
              <div className="font-medium">New email received</div>
              <div className="text-xs">{data.from}</div>
            </div>
          </div>,
        )
      }
    } catch (error) {
      console.error("Error handling message:", error)
    }
  }

  return (
    <WebSocketProvider
      url="ws://localhost:8080/api/v1/ws"
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onMessage={handleMessage}
    >
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Mail className="h-5 w-5 text-primary" />
            <span>EchoLoop</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs",
                isConnected ? "text-green-500" : "text-red-500",
              )}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isConnected ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              <span>{isLoading ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            <UserNav />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>
      <Toaster />
    </WebSocketProvider>
  )
}
