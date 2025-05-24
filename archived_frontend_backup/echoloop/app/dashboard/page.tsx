import { DashboardLayout } from "@/components/dashboard-layout"
import { EmailSummarizer } from "@/components/email-summarizer"
import { NotificationCenter } from "@/components/notification-center"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex h-full flex-col lg:flex-row">
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <EmailSummarizer />
        </div>
        <div className="w-full border-t lg:w-80 lg:border-l lg:border-t-0">
          <NotificationCenter />
        </div>
      </div>
    </DashboardLayout>
  )
}
