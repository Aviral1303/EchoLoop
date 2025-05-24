"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Copy, Bot, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Clipboard } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Email {
  id: string
  sender: string
  subject: string
  timestamp: string
  summary: string[] | string
  body?: string
}

export function EmailSummarizer() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const isInitialRender = useRef(true)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const {
    data: emailsData = [],
    isPending,
    refetch: refetchEmails,
  } = { data: [], isPending: false, refetch: () => {} }; // Mock for replacement

  // Track emails and show popup for new ones
  useEffect(() => {
    if (emailsData && emailsData.length > 0) {
      if (isInitialRender.current) {
        isInitialRender.current = false
        return
      }

      // Get the most recent email
      const latestEmail = emailsData[0]

      // Show a toast notification with the summary
      toast({
        title: `New email from ${latestEmail.sender}`,
        description: `Subject: ${latestEmail.subject}`,
        action: (
          <Button variant="outline" size="sm" onClick={() => refetchEmails()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        ),
      })
    }
  }, [emailsData, toast, refetchEmails])

  const handleCopy = (text: string | string[]) => {
    const summaryText = Array.isArray(text) ? text.join("\n") : text;
    navigator.clipboard.writeText(summaryText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "Summary has been copied to your clipboard.",
    })
  }

  const handleRefresh = () => {
    // Simulate refreshing emails
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setLastRefreshed(new Date())
      toast({
        title: "Summaries refreshed",
        description: "Email summaries have been updated."
      })
    }, 1500)
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    toast({
      title: autoRefresh ? "Auto-refresh disabled" : "Auto-refresh enabled",
      description: autoRefresh ? "Emails will no longer refresh automatically" : "Emails will refresh automatically"
    })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold">Email Summaries</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className={cn(autoRefresh && "border-primary text-primary")}
          >
            {autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading || isPending}>
            <RefreshCw className={cn("h-4 w-4", (loading || isPending) && "animate-spin")} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="p-2 text-xs text-muted-foreground">
        Last updated: {lastRefreshed.toLocaleTimeString()}
      </div>

      <ScrollArea className="flex-1 pb-4">
        <div className="space-y-4 p-4">
          {loading || isPending ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-5/6" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-[100px]" />
                </CardFooter>
              </Card>
            ))
          ) : (
            // Email summaries
            emailsData.map((email: Email) => (
              <Card key={email.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardDescription>{email.sender}</CardDescription>
                  <CardTitle className="text-base">{email.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(email.summary) ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {email.summary.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{email.summary}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(email.summary)}
                    className="flex items-center gap-1"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
