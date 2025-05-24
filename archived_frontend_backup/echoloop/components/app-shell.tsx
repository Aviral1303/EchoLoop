"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { WebSocketProvider } from "@/components/websocket-provider"
import { Loader2, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsConnected(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <WebSocketProvider
      url="ws://localhost:8000/api/v1/ws"
      onConnect={() => setIsConnected(true)}
      onDisconnect={() => setIsConnected(false)}
      onMessage={(data) => {
        toast({
          title: "New Email Received",
          description: `From: ${data.sender}`,
          duration: 3000,
        })
      }}
    >
      {isLoading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2 text-2xl font-bold text-brand">
              <Mail className="h-8 w-8" />
              <span>EchoLoop</span>
            </div>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </motion.div>
        </div>
      ) : (
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex w-full flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
              <div className="flex items-center gap-4">
                <ModeToggle />
                <UserNav />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      )}
    </WebSocketProvider>
  )
}
