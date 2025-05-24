"use client"

import { useState, useEffect, useRef } from "react"

import { useQuery } from "@tanstack/react-query"
import { Bot, Check, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { fetchEmailSummaries } from "@/lib/api"

export function EmailSummarizer() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const isInitialRender = useRef(true)

  const {
    data: emails = [],
    isPending,
    refetch: refetchEmails,
  } = useQuery({
    queryKey: ["emails"],
    queryFn: fetchEmailSummaries,
  })

  // Auto-refresh emails periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchEmails()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refetchEmails])

  // Track emails and show popup for new ones
  useEffect(() => {
    if (emails && emails.length > 0) {
      if (isInitialRender.current) {
        isInitialRender.current = false
        return
      }

      // Get the most recent email
      const latestEmail = emails[0]

      // Show a toast notification with the summary
      toast({
        title: `New Email: ${latestEmail.subject}`,
        description: (
          <div className="mt-2">
            <p className="mb-2 text-sm font-medium">From: {latestEmail.sender}</p>
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <ul className="list-inside space-y-1 text-xs">
                {latestEmail.summary.slice(0, 2).map((point, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
                {latestEmail.summary.length > 2 && (
                  <li className="text-xs text-muted-foreground pl-4">+{latestEmail.summary.length - 2} more points</li>
                )}
              </ul>
            </div>
          </div>
        ),
        duration: 5000,
        action: (
          <Button variant="outline" size="sm" onClick={() => refetchEmails()}>
            View All
          </Button>
        ),
      })
    }
  }, [emails, toast, refetchEmails])

  const handleCopy = () => {
    if (emails && emails.length > 0) {
      const summary = emails[0].summary.join("\n") // Join the summary points into a single string
      navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied to your clipboard.",
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Email Summarizer</h1>

      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Auto-Summarized Emails</h2>
            <p className="text-sm text-muted-foreground">Your emails are automatically summarized as they arrive</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchEmails()} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="rounded-lg border">
          {isPending ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin text-primary" />
              <span>Fetching and summarizing emails...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No emails to summarize</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                New emails will be automatically summarized as they arrive
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {emails.map((email) => (
                <div key={email.id} className="p-4 hover:bg-muted/50">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">{email.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(email.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="mb-2 text-sm text-muted-foreground">From: {email.sender}</div>
                  <div className="rounded-md bg-primary/10 p-3 text-primary">
                    <ul className="list-inside space-y-1 text-sm">
                      {email.summary.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* {isPending && (
        <Card className="mb-6 border border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Summarizing with your agent...</p>
            </div>
          </CardContent>
        </Card>
      )} */}

      {emails.length > 0 && !isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>AI-generated summary of your email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-primary/10 p-4 text-primary">
                <ul className="list-inside space-y-1 text-sm">
                  {emails[0].summary.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">
                <h3 className="mb-2 font-medium">Original Email:</h3>
                <div className="whitespace-pre-wrap rounded-lg bg-muted p-4">{emails[0].body}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Check className="mr-1 h-3 w-3 text-green-500" />
              Summarized by EchoLoop
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetchEmails()}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Re-summarize
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-3 w-3" />
                    Copy summary
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
