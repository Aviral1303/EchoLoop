'use client';

import { DashboardLayout } from "@/components/dashboard-layout"
import { EmailSummarizer } from "@/components/email-summarizer"
import { NotificationCenter } from "@/components/notification-center"
import { useAuth } from "@/hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { authenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/');
    }
  }, [loading, authenticated, router]);
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  }
  
  if (!authenticated) {
    return null;
  }
  
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
