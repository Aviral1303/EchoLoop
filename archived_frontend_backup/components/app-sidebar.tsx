"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Archive, Clock, Cog, Inbox, Mail, RefreshCw, Search, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Bot, Home, Settings } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"

export function AppSidebar() {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleRefresh = () => {
    toast({
      title: "Refreshing emails",
      description: "Fetching your latest emails...",
    })
    // Here you would call the refresh API endpoint
  }

  const sidebarItems = [
    { icon: Inbox, label: "Inbox", path: "/" },
    { icon: Star, label: "Starred", path: "/starred" },
    { icon: Clock, label: "Snoozed", path: "/snoozed" },
    { icon: Archive, label: "Archived", path: "/archived" },
    { icon: Trash2, label: "Trash", path: "/trash" },
  ]

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
    <div className="flex h-full flex-col">
      <SidebarProvider>
        <Sidebar className="flex-1 overflow-hidden">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Mail className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">EchoLoop</span>
            </div>
            <div className="p-2">
              <Button onClick={handleRefresh} className="w-full justify-start gap-2" variant="outline">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search emails" className="pl-8" />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <Link href={item.path} passHref legacyBehavior>
                    <SidebarMenuButton asChild isActive={pathname === item.path}>
                      <a className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.path === "/" && (
                          <div className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                            12
                          </div>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <Separator className="my-2" />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/settings" passHref legacyBehavior>
                  <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                    <a className="flex items-center gap-2">
                      <Cog className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
      <div className="flex items-center justify-between border-t p-4">
        <ModeToggle />
        <UserNav />
      </div>
    </div>
  )
}
