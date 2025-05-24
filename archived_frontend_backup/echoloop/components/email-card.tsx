"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { Check, ChevronRight, Eye, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { markAsSeen } from "@/lib/api"
import type { Email } from "@/types/email"

interface EmailCardProps {
  email: Email
  onClick: () => void
  view: "grid" | "list"
}

export function EmailCard({ email, onClick, view }: EmailCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isStarred, setIsStarred] = useState(email.starred || false)
  const [isSeen, setIsSeen] = useState(email.seen || false)

  const handleMarkAsSeen = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await markAsSeen(email.id)
      setIsSeen(true)
    } catch (error) {
      console.error("Failed to mark as seen:", error)
    }
  }

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsStarred(!isStarred)
  }

  const formattedDate = format(new Date(email.timestamp), "MMM d, h:mm a")

  return (
    <Card
      className={cn(
        "email-card cursor-pointer overflow-hidden transition-all hover:shadow-md",
        !isSeen && "border-l-4 border-l-brand",
        view === "list" ? "flex flex-row" : "",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {view === "list" ? (
        <div className="flex w-full">
          <div className="flex w-16 flex-shrink-0 items-center justify-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                !isSeen ? "bg-brand-muted text-brand" : "bg-muted text-muted-foreground",
              )}
            >
              {email.sender.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-1 flex-col py-4 pr-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className={cn("font-medium", !isSeen && "font-semibold")}>{email.sender}</h3>
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleStar}>
                        <Star
                          className={cn(
                            "h-4 w-4",
                            isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                          )}
                        />
                        <span className="sr-only">Star</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isStarred ? "Unstar" : "Star"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {!isSeen && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMarkAsSeen}>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark as read</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <h4 className="mt-1 font-medium">{email.subject}</h4>
            <div className="mt-2">
              <ul className="space-y-1">
                {email.summary.slice(0, 2).map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                    <span className="line-clamp-1">{point}</span>
                  </li>
                ))}
                {email.summary.length > 2 && (
                  <li className="text-sm text-muted-foreground">
                    <span className="ml-6">+{email.summary.length - 2} more points</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="flex items-center pr-2">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <>
          <CardHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    !isSeen ? "bg-brand-muted text-brand" : "bg-muted text-muted-foreground",
                  )}
                >
                  {email.sender.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={cn("text-sm font-medium", !isSeen && "font-semibold")}>{email.sender}</h3>
                  <p className="text-xs text-muted-foreground">{formattedDate}</p>
                </div>
              </div>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleStar}>
                  <Star
                    className={cn("h-4 w-4", isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")}
                  />
                  <span className="sr-only">Star</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <h4 className="font-medium">{email.subject}</h4>
            <div className="mt-2">
              <ul className="space-y-1">
                {email.summary.slice(0, 3).map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                    <span className="line-clamp-2">{point}</span>
                  </li>
                ))}
                {email.summary.length > 3 && (
                  <li className="text-sm text-muted-foreground">
                    <span className="ml-6">+{email.summary.length - 3} more points</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-4 pt-0">
            {!isSeen && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleMarkAsSeen}>
                <Eye className="mr-1 h-3 w-3" />
                Mark as read
              </Button>
            )}
            <Button variant="ghost" size="sm" className="ml-auto h-8 px-2 text-xs">
              View
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
