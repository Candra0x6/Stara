"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, BarChart3, User, FileText, Bell, Search, Menu, X, Home, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Logo } from "./navbar-with-children"
import { useRouter } from "next/navigation"

interface TopNavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
  user?: {
    name: string
    avatar?: string
    notifications: number
  }
}

export function DashboardNavigation({ activeSection, onSectionChange, user }: TopNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, link: "/dashboard" },
    { id: "profile", label: "Profile", icon: User, link: "/dashboard/profile" },
    { id: "cv-builder", label: "CV Builder", icon: Briefcase, link: "/dashboard/cv-builder" },
  ]

  return (
    <motion.header
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-xl bg-white/60 backdrop-blur-2xl px-4 py-2 lg:flex dark:bg-neutral-950",
        "fixed top-0 inset-x-0 mt-2 "
      )}
    >
      <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:flex items-center justify-between h-16 w-full">
          {/* Logo/Brand */}
          <Logo />
          {/* Desktop Navigation */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id)
                  router.push(item.link)

                }}
                className={`relative flex items-center border-none gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === item.id
                    ? "bg-primary text-white shadow-lg"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-transparent"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <motion.div
                    className="absolute inset-0 bg-primary rounded-xl -z-10"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>


          {/* User Section */}
          <div className="flex items-center gap-3">


            {/* User Avatar */}
            <motion.div
              className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">Professional</p>
              </div>
            </motion.div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-gray-200 py-4"
        >
          {/* Mobile Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="search" placeholder="Search..." className="pl-10 rounded-xl" />
            </div>
          </div>

          {/* Mobile Navigation Items */}
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id)
                  setIsMobileMenuOpen(false)
                  router.push(item.link)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeSection === item.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

      </nav>
    </motion.header>
  )
}
