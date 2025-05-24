import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsPanel } from "@/components/settings-panel"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>
        <SettingsPanel />
      </div>
    </DashboardLayout>
  )
}
