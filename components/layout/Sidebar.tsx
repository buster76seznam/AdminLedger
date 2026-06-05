"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  DollarSign,
  FileStack,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Bot,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Transactions", href: "/dashboard/transactions", icon: DollarSign },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileStack },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Contacts", href: "/dashboard/contacts", icon: Users },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-white">OpsMate AI</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-800 px-6 py-4">
        <div className="text-xs text-gray-400">
          <p className="font-medium">OpsMate AI</p>
          <p>Your affordable admin and bookkeeping copilot</p>
        </div>
      </div>
    </div>
  )
}
