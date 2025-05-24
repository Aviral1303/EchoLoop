'use client';

import Link from "next/link"
import { ArrowRight, Bot, Clock, Mail, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">EchoLoop</span>
        </div>
        <GoogleLoginButton />
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-between gap-8 py-12 md:flex-row md:py-24">
        <div className="flex flex-col space-y-4 md:w-1/2">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your AI Agent for Everyday Work
          </h1>
          <p className="text-xl text-muted-foreground">
            Summarize emails, track your work, and automate repetitive tasks with one personal AI agent.
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Try the App <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative h-[350px] w-full md:w-1/2">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-full max-w-md rounded-xl border bg-card p-4 shadow-lg">
                <div className="mb-2 text-sm font-medium">Email Summary</div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Original email from: team@company.com</p>
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <ul className="list-inside list-disc space-y-1">
                      <li>Meeting scheduled for Thursday at 2pm</li>
                      <li>Project deadline extended to next Friday</li>
                      <li>New team member joining next week</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12 md:py-24">
        <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-md">
            <Mail className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Email Summarization</h3>
            <p className="text-muted-foreground">
              Paste any email and get an instant, concise summary of the key points and action items.
            </p>
          </div>
          <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-md">
            <Bot className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 text-xl font-bold">In-App AI Notifications</h3>
            <p className="text-muted-foreground">
              Get real-time updates when your AI agent completes tasks or discovers important information.
            </p>
          </div>
          <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-md">
            <Zap className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Agent Builder</h3>
            <p className="text-muted-foreground">
              Create custom workflows to automate repetitive tasks with our intuitive agent builder. (Coming soon)
            </p>
          </div>
          <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-md">
            <Clock className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Auto Activity Timeline</h3>
            <p className="text-muted-foreground">
              Keep track of all your summarized emails and agent activities in a chronological timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-bold">EchoLoop</span>
            <span className="text-sm text-muted-foreground">Your AI Agent for Everyday Work</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              GitHub
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
            <a href="#" className="hover:text-foreground">
              Feedback
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
