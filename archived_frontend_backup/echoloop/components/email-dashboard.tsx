"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Filter, RefreshCw, Search, SlidersHorizontal } from "lucide-react"
import { EmailCard } from "@/components/email-card"
import { EmailDetail } from "@/components/email-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmailSkeleton } from "@/components/email-skeleton"
import { EmptyState } from "@/components/empty-state"
import { fetchEmailSummaries } from "@/lib/api"
import type { Email } from "@/types/email"

export function EmailDashboard() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("list")

  const {
    data: emails,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["emails"],
    queryFn: fetchEmailSummaries,
    initialData: [],
  })

  const filteredEmails = emails
    .filter((email) => {
      if (filter === "read") return email.seen
      if (filter === "unread") return !email.seen
      return true
    })
    .filter((email) => {
      if (!searchQuery) return true
      return (
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.summary.some((point) => point.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
  }

  const handleCloseDetail = () => {
    setSelectedEmail(null)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inbox</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem checked={view === "list"} onCheckedChange={() => setView("list")}>
                  List View
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={view === "grid"} onCheckedChange={() => setView("grid")}>
                  Grid View
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem checked={filter === "all"} onCheckedChange={() => setFilter("all")}>
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filter === "read"} onCheckedChange={() => setFilter("read")}>
                  Read
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filter === "unread"} onCheckedChange={() => setFilter("unread")}>
                  Unread
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" onClick={() => setFilter("all")}>
            All
          </TabsTrigger>
          <TabsTrigger value="unread" onClick={() => setFilter("unread")}>
            Unread
          </TabsTrigger>
          <TabsTrigger value="read" onClick={() => setFilter("read")}>
            Read
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className={`grid gap-4 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : ""}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <EmailSkeleton key={i} />
              ))}
            </div>
          ) : filteredEmails.length === 0 ? (
            <EmptyState
              title="No emails found"
              description={searchQuery ? "Try a different search term" : "Your inbox is empty"}
            />
          ) : (
            <div className={`grid gap-4 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : ""}`}>
              <AnimatePresence>
                {filteredEmails.map((email) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <EmailCard email={email} onClick={() => handleEmailClick(email)} view={view} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
        <TabsContent value="unread" className="mt-0">
          {/* Content for unread tab - handled by filter state */}
        </TabsContent>
        <TabsContent value="read" className="mt-0">
          {/* Content for read tab - handled by filter state */}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedEmail && <EmailDetail email={selectedEmail} onClose={handleCloseDetail} />}
      </AnimatePresence>
    </div>
  )
}
