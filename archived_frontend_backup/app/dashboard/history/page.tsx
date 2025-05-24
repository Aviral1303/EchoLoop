import { DashboardLayout } from "@/components/dashboard-layout"
import { HistoryTimeline } from "@/components/history-timeline"

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-2xl font-bold">History</h1>
        <HistoryTimeline />
      </div>
    </DashboardLayout>
  )
}
