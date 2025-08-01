"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Type, Contrast, Eye, Keyboard, Zap, RotateCcw, Save, Info, CheckCircle } from "lucide-react"

interface AccessibilitySettings {
  textSize: number
  lineHeight: number
  letterSpacing: number
  fontFamily: string
  highContrast: boolean
  darkMode: boolean
  colorBlindSupport: boolean
  dyslexiaFont: boolean
  screenReaderMode: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
  skipLinks: boolean
  reducedMotion: boolean
  autoplayMedia: boolean
  flashingContent: boolean
  cursorSize: number
  clickAssist: boolean
}

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange: (hasActive: boolean) => void
}

const defaultSettings: AccessibilitySettings = {
  textSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontFamily: "default",
  highContrast: false,
  darkMode: false,
  colorBlindSupport: false,
  dyslexiaFont: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  focusIndicators: true,
  skipLinks: true,
  reducedMotion: false,
  autoplayMedia: true,
  flashingContent: true,
  cursorSize: 1,
  clickAssist: false,
}

const fontOptions = [
  { value: "default", label: "Default Font", description: "System default font" },
  { value: "arial", label: "Arial", description: "Clean, sans-serif font" },
  { value: "verdana", label: "Verdana", description: "Highly legible font" },
  { value: "tahoma", label: "Tahoma", description: "Compact, readable font" },
  { value: "opendyslexic", label: "OpenDyslexic", description: "Designed for dyslexia" },
  { value: "comic-sans", label: "Comic Sans", description: "Friendly, rounded font" },
]

export default function AccessibilityPanel({ isOpen, onClose, onSettingsChange }: AccessibilityPanelProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibility-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved accessibility settings:", error)
      }
    }
  }, [])

  // Check if any settings are active (different from defaults)
  useEffect(() => {
    const hasActiveSettings = Object.keys(settings).some((key) => {
      const settingKey = key as keyof AccessibilitySettings
      return settings[settingKey] !== defaultSettings[settingKey]
    })
    onSettingsChange(hasActiveSettings)
  }, [settings, onSettingsChange])

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement

    // Text settings
    root.style.setProperty("--accessibility-font-size", `${settings.textSize}px`)
    root.style.setProperty("--accessibility-line-height", settings.lineHeight.toString())
    root.style.setProperty("--accessibility-letter-spacing", `${settings.letterSpacing}px`)

    // Font family
    if (settings.fontFamily !== "default") {
      root.style.setProperty("--accessibility-font-family", settings.fontFamily)
    }

    // Visual settings
    root.classList.toggle("high-contrast", settings.highContrast)
    root.classList.toggle("dark-mode", settings.darkMode)
    root.classList.toggle("dyslexia-font", settings.dyslexiaFont)
    root.classList.toggle("reduced-motion", settings.reducedMotion)
    root.classList.toggle("screen-reader-mode", settings.screenReaderMode)

    // Cursor settings
    root.style.setProperty("--accessibility-cursor-size", settings.cursorSize.toString())
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Save to localStorage
    localStorage.setItem("accessibility-settings", JSON.stringify(settings))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    localStorage.removeItem("accessibility-settings")
  }

  const selectedFont = fontOptions.find((font) => font.value === settings.fontFamily)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id="accessibility-panel"
        role="dialog"
        aria-labelledby="accessibility-panel-title"
        aria-describedby="accessibility-panel-description"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 id="accessibility-panel-title" className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Accessibility Settings
              </h2>
              <p id="accessibility-panel-description" className="text-sm text-muted-foreground mt-1">
                Customize your experience for better accessibility
              </p>
            </div>

            <div className="flex items-center gap-2">
              {saved && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-emerald-600"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Saved</span>
                </motion.div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full"
                aria-label="Close accessibility panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Text & Reading */}
          <Card className="rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Type className="h-5 w-5" />
                Text & Reading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="text-size">Text Size</Label>
                  <Badge variant="secondary" className="rounded-full">
                    {settings.textSize}px
                  </Badge>
                </div>
                <Slider
                  id="text-size"
                  value={[settings.textSize]}
                  onValueChange={([value]) => updateSetting("textSize", value)}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                  aria-label="Adjust text size"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>

              {/* Line Height */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="line-height">Line Height</Label>
                  <Badge variant="secondary" className="rounded-full">
                    {settings.lineHeight}
                  </Badge>
                </div>
                <Slider
                  id="line-height"
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSetting("lineHeight", value)}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                  aria-label="Adjust line height"
                />
              </div>

              {/* Letter Spacing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="letter-spacing">Letter Spacing</Label>
                  <Badge variant="secondary" className="rounded-full">
                    {settings.letterSpacing}px
                  </Badge>
                </div>
                <Slider
                  id="letter-spacing"
                  value={[settings.letterSpacing]}
                  onValueChange={([value]) => updateSetting("letterSpacing", value)}
                  min={0}
                  max={3}
                  step={0.5}
                  className="w-full"
                  aria-label="Adjust letter spacing"
                />
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => updateSetting("fontFamily", value)}>
                  <SelectTrigger id="font-family" className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <div>
                          <div className="font-medium">{font.label}</div>
                          <div className="text-xs text-muted-foreground">{font.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFont && <p className="text-xs text-muted-foreground">{selectedFont.description}</p>}
              </div>

              {/* Dyslexia Font */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dyslexia-font">Dyslexia-Friendly Font</Label>
                  <p className="text-xs text-muted-foreground">Use fonts designed for better readability</p>
                </div>
                <Switch
                  id="dyslexia-font"
                  checked={settings.dyslexiaFont}
                  onCheckedChange={(checked) => updateSetting("dyslexiaFont", checked)}
                  aria-describedby="dyslexia-font-desc"
                />
              </div>
            </CardContent>
          </Card>

          {/* Visual & Contrast */}
          <Card className="rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Contrast className="h-5 w-5" />
                Visual & Contrast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-xs text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Reduce eye strain in low light</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting("darkMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="colorblind-support">Color Blind Support</Label>
                  <p className="text-xs text-muted-foreground">Enhanced color differentiation</p>
                </div>
                <Switch
                  id="colorblind-support"
                  checked={settings.colorBlindSupport}
                  onCheckedChange={(checked) => updateSetting("colorBlindSupport", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Navigation & Interaction */}
          <Card className="rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Keyboard className="h-5 w-5" />
                Navigation & Interaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="screen-reader">Screen Reader Mode</Label>
                  <p className="text-xs text-muted-foreground">Optimize for screen readers</p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReaderMode}
                  onCheckedChange={(checked) => updateSetting("screenReaderMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
                  <p className="text-xs text-muted-foreground">Improved keyboard shortcuts and focus</p>
                </div>
                <Switch
                  id="keyboard-nav"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="focus-indicators">Visible Focus Indicators</Label>
                  <p className="text-xs text-muted-foreground">Clear outlines around focused elements</p>
                </div>
                <Switch
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) => updateSetting("focusIndicators", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="skip-links">Skip Navigation Links</Label>
                  <p className="text-xs text-muted-foreground">Quick navigation shortcuts</p>
                </div>
                <Switch
                  id="skip-links"
                  checked={settings.skipLinks}
                  onCheckedChange={(checked) => updateSetting("skipLinks", checked)}
                />
              </div>

              {/* Cursor Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cursor-size">Cursor Size</Label>
                  <Badge variant="secondary" className="rounded-full">
                    {settings.cursorSize}x
                  </Badge>
                </div>
                <Slider
                  id="cursor-size"
                  value={[settings.cursorSize]}
                  onValueChange={([value]) => updateSetting("cursorSize", value)}
                  min={1}
                  max={3}
                  step={0.5}
                  className="w-full"
                  aria-label="Adjust cursor size"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="click-assist">Click Assistance</Label>
                  <p className="text-xs text-muted-foreground">Larger click targets and hover delays</p>
                </div>
                <Switch
                  id="click-assist"
                  checked={settings.clickAssist}
                  onCheckedChange={(checked) => updateSetting("clickAssist", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Motion & Media */}
          <Card className="rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                Motion & Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion">Reduce Motion</Label>
                  <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="autoplay-media">Pause Autoplay Media</Label>
                  <p className="text-xs text-muted-foreground">Prevent videos and audio from auto-playing</p>
                </div>
                <Switch
                  id="autoplay-media"
                  checked={!settings.autoplayMedia}
                  onCheckedChange={(checked) => updateSetting("autoplayMedia", !checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="flashing-content">Hide Flashing Content</Label>
                  <p className="text-xs text-muted-foreground">Reduce seizure triggers from flashing elements</p>
                </div>
                <Switch
                  id="flashing-content"
                  checked={!settings.flashingContent}
                  onCheckedChange={(checked) => updateSetting("flashingContent", !checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="rounded-xl border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Accessibility Commitment</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                    We're committed to making our platform accessible to everyone. These settings are automatically
                    saved and will persist across your sessions. If you need additional accommodations, please contact
                    our support team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 rounded-xl bg-transparent"
              aria-label="Reset all accessibility settings to default"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              aria-label="Save accessibility settings"
            >
              {isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
