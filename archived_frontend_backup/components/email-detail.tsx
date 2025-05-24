"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  Archive,
  ArrowLeft,
  Check,
  Clock,
  Forward,
  MoreHorizontal,
  Reply,
  ReplyAll,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { markAsSeen } from "@/lib/api"
import type { Email } from "@/types/email"

interface EmailDetailProps {
  email: Email
  onClose: () => void
}

export function EmailDetail({ email, onClose }: EmailDetailProps) {
  useEffect(() => {
    if (!email.seen) {
      markAsSeen(email.id).catch(console.error)
    }

    // Add escape key listener to close detail view
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [email, onClose])

  const formattedDate = format(new Date(email.timestamp), "EEEE, MMMM d, yyyy 'at' h:mm a")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl overflow-hidden rounded-lg border bg-card shadow-lg"
      >
        <Card className="flex h-[80vh] flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h2 className="text-xl font-semibold">{email.subject}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 overflow-auto p-0">
            <div className="flex flex-col md:flex-row">
              {/* Summary Panel */}
              <div className="border-b p-4 md:w-1/3 md:border-b-0 md:border-r">
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-medium">AI Summary</h3>
                  <ul className="space-y-2">
                    {email.summary.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">From:</span>
                    <span>{email.sender}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">To:</span>
                    <span>me@example.com</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <div className="flex-1 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {email.sender.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{email.sender}</h3>
                      <p className="text-xs text-muted-foreground">to me</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {/* This would be the actual email content */}
                  <p>Hello,</p>
                  <p>
                    Thank you for your interest in our product. As requested, I'm sending you the information about our
                    latest features and pricing options.
                  </p>
                  <p>
                    Our new AI-powered analytics dashboard provides real-time insights into your customer behavior,
                    helping you make data-driven decisions faster than ever before.
                  </p>
                  <p>The premium plan includes:</p>
                  <ul>
                    <li>Unlimited user accounts</li>
                    <li>Advanced reporting features</li>
                    <li>Priority customer support</li>
                    <li>Custom integration options</li>
                  </ul>
                  <p>Please let me know if you have any questions or if you'd like to schedule a demo.</p>
                  <p>Best regards,</p>
                  <p>{email.sender}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-between p-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ReplyAll className="h-3 w-3" />
                <span className="hidden sm:inline">Reply All</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Forward className="h-3 w-3" />
                <span className="hidden sm:inline">Forward</span>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Archive className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Archive</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-destructive">
                <Trash2 className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
