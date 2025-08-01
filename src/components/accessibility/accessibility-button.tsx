"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accessibility, Settings } from "lucide-react"
import AccessibilityPanel from "./accessibility-panel"

interface AccessibilityButtonProps {
  className?: string
  position?: "fixed" | "relative"
}

export default function AccessibilityButton({ className = "", position = "fixed" }: AccessibilityButtonProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [hasActiveSettings, setHasActiveSettings] = useState(false)

  const handleTogglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  const handleSettingsChange = (hasActive: boolean) => {
    setHasActiveSettings(hasActive)
  }

  return (
    <>
      {/* Accessibility Button */}
      <motion.div
        className={`${position === "fixed" ? "fixed bottom-6 right-6" : ""} z-50 ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="relative">
          <Button
            onClick={handleTogglePanel}
            className={`
              h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
              bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600
              text-white border-2 border-white/20 hover:border-white/30
              focus:ring-4 focus:ring-blue-500/50 focus:outline-none
              ${isPanelOpen ? "scale-110" : ""}
            `}
            aria-label="Open accessibility settings panel"
            aria-expanded={isPanelOpen}
            aria-controls="accessibility-panel"
            title="Accessibility Settings"
          >
            <motion.div animate={{ rotate: isPanelOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
              {isPanelOpen ? <Settings className="h-6 w-6" /> : <Accessibility className="h-6 w-6" />}
            </motion.div>
          </Button>

          {/* Active Settings Indicator */}
          <AnimatePresence>
            {hasActiveSettings && !isPanelOpen && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  aria-label="Active accessibility settings"
                >
                  !
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
              Accessibility Settings
              <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <AccessibilityPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            onSettingsChange={handleSettingsChange}
          />
        )}
      </AnimatePresence>
    </>
  )
}
