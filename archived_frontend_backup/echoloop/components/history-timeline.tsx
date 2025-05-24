"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface HistoryItem {
  id: string
  date: Date
  emailSubject: string
  emailSnippet: string
  summary: string
}

// Mock data for history items
const mockHistoryItems: HistoryItem[] = [
  {
    id: "1",
    date: new Date(),
    emailSubject: "Project Update - Q2 Roadmap",
    emailSnippet: "Hi team, I wanted to share the latest updates on our Q2 roadmap...",
    summary:
      "• Q2 roadmap finalized with 3 major feature releases\n• Team capacity increased by 20%\n• Budget approval pending",
  },
  {
    id: "2",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    emailSubject: "Meeting Notes: Product Strategy",
    emailSnippet: "Following up on our discussion about the product strategy...",
    summary:
      "• Competitor analysis shows we're leading in 3 of 5 metrics\n• User research identified 2 critical pain points\n• Mobile app engagement up 15%",
  },
  {
    id: "3",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    emailSubject: "Campaign Results - Spring Promotion",
    emailSnippet: "Here are the results from our spring promotion campaign...",
    summary:
      "• Spring promotion resulted in 32% increase in sign-ups\n• Email open rates averaged 28%\n• ROI calculated at 3.8x",
  },
  {
    id: "4",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    emailSubject: "API Documentation Updates",
    emailSnippet: "We've made some important updates to our API documentation...",
    summary:
      "• New endpoints added for user preferences\n• Authentication flow updated\n• Rate limiting increased for premium tier",
  },
]

export function HistoryTimeline() {
  const [searchQuery, setSearchQuery] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filteredItems = mockHistoryItems.filter((item) => {
    // Filter by date if selected
    if (date) {
      const itemDate = new Date(item.date)
      if (
        itemDate.getDate() !== date.getDate() ||
        itemDate.getMonth() !== date.getMonth() ||
        itemDate.getFullYear() !== date.getFullYear()
      ) {
        return false
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.emailSubject.toLowerCase().includes(query) ||
        item.emailSnippet.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Group items by date
  const groupedItems: Record<string, HistoryItem[]> = {}
  filteredItems.forEach((item) => {
    const dateKey = format(item.date, "yyyy-MM-dd")
    if (!groupedItems[dateKey]) {
      groupedItems[dateKey] = []
    }
    groupedItems[dateKey].push(item)
  })

  const dateKeys = Object.keys(groupedItems).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search emails or summaries..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
            {date && (
              <div className="flex items-center justify-center p-2">
                <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {dateKeys.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No history items found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {dateKeys.map((dateKey) => (
            <div key={dateKey}>
              <h3 className="mb-4 text-lg font-semibold">
                {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                {dateKey === dateKeys[0] && " (Today)"}
                {dateKey === dateKeys[1] && " (Yesterday)"}
              </h3>
              <div className="space-y-4">
                {groupedItems[dateKey].map((item) => (
                  <Collapsible key={item.id} open={expandedItems[item.id]} onOpenChange={() => toggleExpand(item.id)}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{item.emailSubject}</CardTitle>
                          <span className="text-xs text-muted-foreground">{format(item.date, "h:mm a")}</span>
                        </div>
                        <CardDescription className="line-clamp-1">{item.emailSnippet}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                          <div className="whitespace-pre-line text-sm">{item.summary}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <span>{expandedItems[item.id] ? "Hide details" : "View details"}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${expandedItems[item.id] ? "rotate-180" : ""}`}
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </CardFooter>
                      <CollapsibleContent>
                        <Separator />
                        <div className="p-4">
                          <h4 className="mb-2 text-sm font-medium">Original Email</h4>
                          <div className="whitespace-pre-line rounded-lg bg-muted p-3 text-sm">
                            <p className="mb-2">
                              <strong>Subject:</strong> {item.emailSubject}
                            </p>
                            <p className="mb-2">
                              <strong>Date:</strong> {format(item.date, "PPpp")}
                            </p>
                            <p>
                              <strong>Content:</strong>
                            </p>
                            <p className="mt-2">
                              {item.emailSnippet}
                              {/* This would be the full email content in a real app */}
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget
                              ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam
                              euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc quis
                              nisl.
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
