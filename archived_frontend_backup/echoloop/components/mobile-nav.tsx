"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Clock, Home, Menu, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

interface MobileNavProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}

export function MobileNav({ isSidebarOpen, setIsSidebarOpen }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "History",
      href: "/dashboard/history",
      icon: Clock,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex h-16 items-center justify-between border-b px-4 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">EchoLoop</span>
      </Link>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
                <Bot className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">EchoLoop</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <nav className="grid gap-1 p-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant="ghost"
                    className={cn("flex h-10 w-full justify-start gap-2", pathname === item.href && "bg-secondary")}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
