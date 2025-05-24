"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  description: string
  timestamp: Date
  read: boolean
  type: "success" | "info" | "pending"
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Simulate receiving notifications
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: "1",
        title: "Summary ready",
        description: "Email from marketing@company.com has been summarized",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        type: "success",
      },
      {
        id: "2",
        title: "Agent activity",
        description: "Your agent has analyzed 3 emails today",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: true,
        type: "info",
      },
    ]

    setNotifications(initialNotifications)

    // Simulate a new notification coming in after 10 seconds
    const timer = setTimeout(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: "New summary ready",
        description: "Email from team@example.com has been summarized",
        timestamp: new Date(),
        read: false,
        type: "success",
      }

      setNotifications((prev) => [newNotification, ...prev])
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return false
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex items-center gap-2">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {notifications.filter((n) => !n.read).length}
          </span>
        </div>
      </div>

      <Tabs defaultValue="all" className="flex flex-col flex-1" onValueChange={setActiveTab}>
        <div className="border-b px-4 py-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-[calc(100%-3.5rem)]">
            <AnimatePresence initial={false}>
              {filteredNotifications.length > 0 ? (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex cursor-pointer gap-3 p-4 hover:bg-muted/50",
                        !notification.read && "bg-primary/5",
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                          notification.type === "success" && "bg-green-100 text-green-600",
                          notification.type === "info" && "bg-blue-100 text-blue-600",
                          notification.type === "pending" && "bg-yellow-100 text-yellow-600",
                        )}
                      >
                        {notification.type === "success" && <Check className="h-4 w-4" />}
                        {notification.type === "info" && <Bot className="h-4 w-4" />}
                        {notification.type === "pending" && <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="unread" className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-[calc(100%-3.5rem)]">
            <AnimatePresence initial={false}>
              {filteredNotifications.length > 0 ? (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex cursor-pointer gap-3 p-4 hover:bg-muted/50",
                        !notification.read && "bg-primary/5",
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                          notification.type === "success" && "bg-green-100 text-green-600",
                          notification.type === "info" && "bg-blue-100 text-blue-600",
                          notification.type === "pending" && "bg-yellow-100 text-yellow-600",
                        )}
                      >
                        {notification.type === "success" && <Check className="h-4 w-4" />}
                        {notification.type === "info" && <Bot className="h-4 w-4" />}
                        {notification.type === "pending" && <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-sm text-muted-foreground">No unread notifications</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
