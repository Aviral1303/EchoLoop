"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { NotificationCenter } from "@/components/notification-center"
import { EmailSummarizer } from "@/components/email-summarizer"

export function DashboardLayout() {
  return (
    <div className="grid h-full grid-cols-12 overflow-hidden">
      {/* Sidebar */}
      <div className="col-span-2 border-r">
        <AppSidebar />
      </div>

      {/* Main content area */}
      <div className="col-span-7 border-r overflow-hidden">
        <EmailSummarizer />
      </div>

      {/* Notification panel */}
      <div className="col-span-3 overflow-hidden">
        <NotificationCenter />
      </div>
    </div>
  )
}
