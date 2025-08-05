"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Mic, Volume2 } from "lucide-react"
import AccessibilityPanel from "./accessibility-panel"

export default function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasActiveSettings, setHasActiveSettings] = useState(false)
  const [isListening, setIsListening] = useState(false)


  return (
    <>
      {/* Main Accessibility Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="relative">
          {/* Active Settings Indicator */}
          {hasActiveSettings && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 z-10">
              <Badge className="bg-emerald-500 text-white rounded-full px-2 py-1 text-xs">Active</Badge>
            </motion.div>
          )}

      
          {/* Main Button */}
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full w-14 h-14 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            aria-label="Open accessibility settings panel"
            aria-describedby="accessibility-button-description"
          >
            <Eye className="h-6 w-6" />
          </Button>

          {/* Screen Reader Description */}
          <div id="accessibility-button-description" className="sr-only">
            Click to open accessibility settings panel where you can customize text size, contrast, motion, and other
            accessibility preferences
          </div>

   
        </div>
      </motion.div>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <AccessibilityPanel
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSettingsChange={setHasActiveSettings}
          />
        )}
      </AnimatePresence>
    </>
  )
}
