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
import { Input } from "@/components/ui/input"
import {
  X,
  Type,
  Contrast,
  Eye,
  Keyboard,
  Zap,
  RotateCcw,
  Save,
  Info,
  CheckCircle,
  Volume2,
  Mic,
  Search,
  Brain,
  Hand,
  Globe,
  Target,
  BookOpen,
  Languages,
  Headphones,
  Lightbulb,
} from "lucide-react"

interface AccessibilitySettings {
  // Text & Reading
  textSize: number
  lineHeight: number
  letterSpacing: number
  fontFamily: string
  dyslexiaFont: boolean
  readingGuide: boolean
  readingMask: boolean
  wordSpacing: number

  // Visual & Contrast
  highContrast: boolean
  darkMode: boolean
  colorBlindSupport: boolean
  customColors: {
    background: string
    text: string
    links: string
    buttons: string
  }
  brightness: number
  saturation: number
  magnification: number
  magnifierType: string

  // Navigation & Interaction
  screenReaderMode: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
  skipLinks: boolean
  cursorSize: number
  clickAssist: boolean
  hoverDelay: number
  stickyFocus: boolean

  // Motion & Media
  reducedMotion: boolean
  autoplayMedia: boolean
  flashingContent: boolean
  parallaxDisabled: boolean
  animationSpeed: number

  // Audio & Voice
  textToSpeech: boolean
  speechRate: number
  speechPitch: number
  speechVolume: number
  voiceCommands: boolean
  audioDescriptions: boolean
  soundEffects: boolean

  // Cognitive Assistance
  simplifiedInterface: boolean
  readingAssistant: boolean
  focusMode: boolean
  distractionFree: boolean
  taskReminders: boolean
  timeoutWarnings: boolean
  confirmActions: boolean

  // Motor Assistance
  dwellClick: boolean
  dwellTime: number
  stickyKeys: boolean
  slowKeys: boolean
  bounceKeys: boolean
  mouseKeys: boolean
  dragAssist: boolean

  // Language & Localization
  language: string
  rightToLeft: boolean
  translation: boolean
  simplifiedLanguage: boolean

  // Seizure Protection
  seizureProtection: boolean
  flashThreshold: number
  redFlashReduction: boolean

  // Custom Shortcuts
  customShortcuts: Record<string, string>
}

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange: (hasActive: boolean) => void
}

const defaultSettings: AccessibilitySettings = {
  // Text & Reading
  textSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontFamily: "default",
  dyslexiaFont: false,
  readingGuide: false,
  readingMask: false,
  wordSpacing: 0,

  // Visual & Contrast
  highContrast: false,
  darkMode: false,
  colorBlindSupport: false,
  customColors: {
    background: "#ffffff",
    text: "#000000",
    links: "#0066cc",
    buttons: "#0066cc",
  },
  brightness: 100,
  saturation: 100,
  magnification: 100,
  magnifierType: "none",

  // Navigation & Interaction
  screenReaderMode: false,
  keyboardNavigation: true,
  focusIndicators: true,
  skipLinks: true,
  cursorSize: 1,
  clickAssist: false,
  hoverDelay: 0,
  stickyFocus: false,

  // Motion & Media
  reducedMotion: false,
  autoplayMedia: true,
  flashingContent: true,
  parallaxDisabled: false,
  animationSpeed: 1,

  // Audio & Voice
  textToSpeech: false,
  speechRate: 1,
  speechPitch: 1,
  speechVolume: 1,
  voiceCommands: false,
  audioDescriptions: false,
  soundEffects: true,

  // Cognitive Assistance
  simplifiedInterface: false,
  readingAssistant: false,
  focusMode: false,
  distractionFree: false,
  taskReminders: false,
  timeoutWarnings: true,
  confirmActions: false,

  // Motor Assistance
  dwellClick: false,
  dwellTime: 1000,
  stickyKeys: false,
  slowKeys: false,
  bounceKeys: false,
  mouseKeys: false,
  dragAssist: false,

  // Language & Localization
  language: "en",
  rightToLeft: false,
  translation: false,
  simplifiedLanguage: false,

  // Seizure Protection
  seizureProtection: false,
  flashThreshold: 3,
  redFlashReduction: false,

  // Custom Shortcuts
  customShortcuts: {},
}

const fontOptions = [
  { value: "default", label: "Default Font", description: "System default font" },
  { value: "arial", label: "Arial", description: "Clean, sans-serif font" },
  { value: "verdana", label: "Verdana", description: "Highly legible font" },
  { value: "tahoma", label: "Tahoma", description: "Compact, readable font" },
  { value: "opendyslexic", label: "OpenDyslexic", description: "Designed for dyslexia" },
  { value: "comic-sans", label: "Comic Sans", description: "Friendly, rounded font" },
  { value: "atkinson", label: "Atkinson Hyperlegible", description: "Enhanced character recognition" },
]

const languageOptions = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ar", label: "العربية" },
]

export default function AccessibilityPanel({ isOpen, onClose, onSettingsChange }: AccessibilityPanelProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [isReading, setIsReading] = useState(false)

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

  // Check if any settings are active
  useEffect(() => {
    const hasActiveSettings = Object.keys(settings).some((key) => {
      const settingKey = key as keyof AccessibilitySettings
      if (typeof settings[settingKey] === "object" && settings[settingKey] !== null) {
        return JSON.stringify(settings[settingKey]) !== JSON.stringify(defaultSettings[settingKey])
      }
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
    root.style.setProperty("--accessibility-word-spacing", `${settings.wordSpacing}px`)

    // Visual settings
    root.style.setProperty("--accessibility-brightness", `${settings.brightness}%`)
    root.style.setProperty("--accessibility-saturation", `${settings.saturation}%`)
    root.style.setProperty("--accessibility-magnification", `${settings.magnification}%`)

    // Custom colors
    if (settings.highContrast || settings.customColors.background !== defaultSettings.customColors.background) {
      root.style.setProperty("--accessibility-bg-color", settings.customColors.background)
      root.style.setProperty("--accessibility-text-color", settings.customColors.text)
      root.style.setProperty("--accessibility-link-color", settings.customColors.links)
      root.style.setProperty("--accessibility-button-color", settings.customColors.buttons)
    }

    // Apply CSS classes
    root.classList.toggle("high-contrast", settings.highContrast)
    root.classList.toggle("dark-mode", settings.darkMode)
    root.classList.toggle("dyslexia-font", settings.dyslexiaFont)
    root.classList.toggle("reduced-motion", settings.reducedMotion)
    root.classList.toggle("screen-reader-mode", settings.screenReaderMode)
    root.classList.toggle("reading-guide", settings.readingGuide)
    root.classList.toggle("reading-mask", settings.readingMask)
    root.classList.toggle("simplified-interface", settings.simplifiedInterface)
    root.classList.toggle("focus-mode", settings.focusMode)
    root.classList.toggle("distraction-free", settings.distractionFree)
    root.classList.toggle("seizure-protection", settings.seizureProtection)
    root.classList.toggle("rtl", settings.rightToLeft)

    // Cursor settings
    root.style.setProperty("--accessibility-cursor-size", settings.cursorSize.toString())
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    console.log(`Updating setting: ${key} with value:`, value)
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateCustomColor = (colorType: keyof AccessibilitySettings["customColors"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [colorType]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    localStorage.setItem("accessibility-settings", JSON.stringify(settings))
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    localStorage.removeItem("accessibility-settings")
  }

  const handleTextToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = settings.speechRate
      utterance.pitch = settings.speechPitch
      utterance.volume = settings.speechVolume
      speechSynthesis.speak(utterance)
      setIsReading(true)
      utterance.onend = () => setIsReading(false)
    }
  }

  const tabs = [
    { id: "text", label: "Text & Reading", icon: Type },
    { id: "visual", label: "Visual", icon: Eye },
    { id: "navigation", label: "Navigation", icon: Keyboard },
    { id: "motion", label: "Motion", icon: Zap },
    { id: "audio", label: "Audio & Voice", icon: Volume2 },
    { id: "cognitive", label: "Cognitive", icon: Brain },
    { id: "motor", label: "Motor", icon: Hand },
    { id: "language", label: "Language", icon: Globe },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-background shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id="accessibility-panel"
        role="dialog"
        aria-labelledby="accessibility-panel-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 id="accessibility-panel-title" className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Advanced Accessibility Settings
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive customization for all accessibility needs
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
                onClick={() => handleTextToSpeech("Accessibility panel closed")}
                className="rounded-full"
                aria-label="Read panel content aloud"
                disabled={isReading}
              >
                <Volume2 className="h-4 w-4" />
              </Button>

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

          {/* Tab Navigation */}
          <div className="px-6 pb-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="rounded-lg whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Text & Reading Tab */}
          {activeTab === "text" && (
            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Type className="h-5 w-5" />
                    Text Customization
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
                      min={10}
                      max={32}
                      step={1}
                      className="w-full"
                    />
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
                      min={1.0}
                      max={3.0}
                      step={0.1}
                      className="w-full"
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
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Word Spacing */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="word-spacing">Word Spacing</Label>
                      <Badge variant="secondary" className="rounded-full">
                        {settings.wordSpacing}px
                      </Badge>
                    </div>
                    <Slider
                      id="word-spacing"
                      value={[settings.wordSpacing]}
                      onValueChange={([value]) => updateSetting("wordSpacing", value)}
                      min={0}
                      max={10}
                      step={1}
                      className="w-full"
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
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5" />
                    Reading Assistance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="dyslexia-font">Dyslexia-Friendly Font</Label>
                      <p className="text-xs text-muted-foreground">Use fonts designed for better readability</p>
                    </div>
                    <Switch
                      id="dyslexia-font"
                      checked={settings.dyslexiaFont}
                      onCheckedChange={(checked) => updateSetting("dyslexiaFont", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="reading-guide">Reading Guide</Label>
                      <p className="text-xs text-muted-foreground">Highlight current line while reading</p>
                    </div>
                    <Switch
                      id="reading-guide"
                      checked={settings.readingGuide}
                      onCheckedChange={(checked) => updateSetting("readingGuide", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="reading-mask">Reading Mask</Label>
                      <p className="text-xs text-muted-foreground">Dim surrounding text to improve focus</p>
                    </div>
                    <Switch
                      id="reading-mask"
                      checked={settings.readingMask}
                      onCheckedChange={(checked) => updateSetting("readingMask", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Visual Tab */}
          {activeTab === "visual" && (
            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Contrast className="h-5 w-5" />
                    Contrast & Colors
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

                  {/* Custom Colors */}
                  <div className="space-y-4 pt-4 border-t">
                    <Label>Custom Color Scheme</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bg-color" className="text-xs">
                          Background
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="bg-color"
                            type="color"
                            value={settings.customColors.background}
                            onChange={(e) => updateCustomColor("background", e.target.value)}
                            className="w-12 h-8 p-1 rounded"
                          />
                          <Input
                            value={settings.customColors.background}
                            onChange={(e) => updateCustomColor("background", e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="text-color" className="text-xs">
                          Text
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="text-color"
                            type="color"
                            value={settings.customColors.text}
                            onChange={(e) => updateCustomColor("text", e.target.value)}
                            className="w-12 h-8 p-1 rounded"
                          />
                          <Input
                            value={settings.customColors.text}
                            onChange={(e) => updateCustomColor("text", e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="h-5 w-5" />
                    Visual Enhancements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Brightness */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="brightness">Brightness</Label>
                      <Badge variant="secondary" className="rounded-full">
                        {settings.brightness}%
                      </Badge>
                    </div>
                    <Slider
                      id="brightness"
                      value={[settings.brightness]}
                      onValueChange={([value]) => updateSetting("brightness", value)}
                      min={50}
                      max={150}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="saturation">Color Saturation</Label>
                      <Badge variant="secondary" className="rounded-full">
                        {settings.saturation}%
                      </Badge>
                    </div>
                    <Slider
                      id="saturation"
                      value={[settings.saturation]}
                      onValueChange={([value]) => updateSetting("saturation", value)}
                      min={0}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Magnification */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="magnification">Screen Magnification</Label>
                      <Badge variant="secondary" className="rounded-full">
                        {settings.magnification}%
                      </Badge>
                    </div>
                    <Slider
                      id="magnification"
                      value={[settings.magnification]}
                      onValueChange={([value]) => updateSetting("magnification", value)}
                      min={100}
                      max={300}
                      step={25}
                      className="w-full"
                    />
                  </div>

                  {/* Magnifier Type */}
                  <div className="space-y-2">
                    <Label htmlFor="magnifier-type">Magnifier Type</Label>
                    <Select
                      value={settings.magnifierType}
                      onValueChange={(value) => updateSetting("magnifierType", value)}
                    >
                      <SelectTrigger id="magnifier-type" className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="lens">Lens Magnifier</SelectItem>
                        <SelectItem value="fullscreen">Full Screen</SelectItem>
                        <SelectItem value="docked">Docked Window</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Audio & Voice Tab */}
          {activeTab === "audio" && (
            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Volume2 className="h-5 w-5" />
                    Text-to-Speech
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="text-to-speech">Enable Text-to-Speech</Label>
                      <p className="text-xs text-muted-foreground">Read text content aloud</p>
                    </div>
                    <Switch
                      id="text-to-speech"
                      checked={settings.textToSpeech}
                      onCheckedChange={(checked) => updateSetting("textToSpeech", checked)}
                    />
                  </div>

                  {settings.textToSpeech && (
                    <>
                      {/* Speech Rate */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="speech-rate">Speech Rate</Label>
                          <Badge variant="secondary" className="rounded-full">
                            {settings.speechRate}x
                          </Badge>
                        </div>
                        <Slider
                          id="speech-rate"
                          value={[settings.speechRate]}
                          onValueChange={([value]) => updateSetting("speechRate", value)}
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Speech Pitch */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="speech-pitch">Speech Pitch</Label>
                          <Badge variant="secondary" className="rounded-full">
                            {settings.speechPitch}
                          </Badge>
                        </div>
                        <Slider
                          id="speech-pitch"
                          value={[settings.speechPitch]}
                          onValueChange={([value]) => updateSetting("speechPitch", value)}
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Speech Volume */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="speech-volume">Speech Volume</Label>
                          <Badge variant="secondary" className="rounded-full">
                            {Math.round(settings.speechVolume * 100)}%
                          </Badge>
                        </div>
                        <Slider
                          id="speech-volume"
                          value={[settings.speechVolume]}
                          onValueChange={([value]) => updateSetting("speechVolume", value)}
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Test Speech */}
                      <Button
                        onClick={() =>
                          handleTextToSpeech(
                            "This is a test of the text-to-speech feature. You can adjust the rate, pitch, and volume to your preference.",
                          )
                        }
                        disabled={isReading}
                        className="w-full rounded-xl"
                      >
                        <Headphones className="h-4 w-4 mr-2" />
                        {isReading ? "Speaking..." : "Test Speech"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mic className="h-5 w-5" />
                    Voice Commands
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="voice-commands">Voice Commands</Label>
                      <p className="text-xs text-muted-foreground">Control interface with voice</p>
                    </div>
                    <Switch
                      id="voice-commands"
                      checked={settings.voiceCommands}
                      onCheckedChange={(checked) => updateSetting("voiceCommands", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
                      <p className="text-xs text-muted-foreground">Describe visual content</p>
                    </div>
                    <Switch
                      id="audio-descriptions"
                      checked={settings.audioDescriptions}
                      onCheckedChange={(checked) => updateSetting("audioDescriptions", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="sound-effects">Sound Effects</Label>
                      <p className="text-xs text-muted-foreground">Audio feedback for interactions</p>
                    </div>
                    <Switch
                      id="sound-effects"
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => updateSetting("soundEffects", checked)}
                    />
                  </div>

                  {settings.voiceCommands && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Available Voice Commands:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• "Accessibility" - Open this panel</li>
                        <li>• "Read page" - Read current page content</li>
                        <li>• "Increase text size" - Make text larger</li>
                        <li>• "High contrast on/off" - Toggle contrast</li>
                        <li>• "Dark mode on/off" - Toggle dark mode</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cognitive Tab */}
          {activeTab === "cognitive" && (
            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="h-5 w-5" />
                    Cognitive Assistance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="simplified-interface">Simplified Interface</Label>
                      <p className="text-xs text-muted-foreground">Reduce visual complexity</p>
                    </div>
                    <Switch
                      id="simplified-interface"
                      checked={settings.simplifiedInterface}
                      onCheckedChange={(checked) => updateSetting("simplifiedInterface", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="reading-assistant">Reading Assistant</Label>
                      <p className="text-xs text-muted-foreground">Highlight and explain complex text</p>
                    </div>
                    <Switch
                      id="reading-assistant"
                      checked={settings.readingAssistant}
                      onCheckedChange={(checked) => updateSetting("readingAssistant", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="focus-mode">Focus Mode</Label>
                      <p className="text-xs text-muted-foreground">Hide non-essential elements</p>
                    </div>
                    <Switch
                      id="focus-mode"
                      checked={settings.focusMode}
                      onCheckedChange={(checked) => updateSetting("focusMode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="distraction-free">Distraction-Free Mode</Label>
                      <p className="text-xs text-muted-foreground">Remove animations and decorative elements</p>
                    </div>
                    <Switch
                      id="distraction-free"
                      checked={settings.distractionFree}
                      onCheckedChange={(checked) => updateSetting("distractionFree", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="task-reminders">Task Reminders</Label>
                      <p className="text-xs text-muted-foreground">Gentle reminders for incomplete tasks</p>
                    </div>
                    <Switch
                      id="task-reminders"
                      checked={settings.taskReminders}
                      onCheckedChange={(checked) => updateSetting("taskReminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="timeout-warnings">Timeout Warnings</Label>
                      <p className="text-xs text-muted-foreground">Warn before session expires</p>
                    </div>
                    <Switch
                      id="timeout-warnings"
                      checked={settings.timeoutWarnings}
                      onCheckedChange={(checked) => updateSetting("timeoutWarnings", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="confirm-actions">Confirm Important Actions</Label>
                      <p className="text-xs text-muted-foreground">Ask for confirmation on critical actions</p>
                    </div>
                    <Switch
                      id="confirm-actions"
                      checked={settings.confirmActions}
                      onCheckedChange={(checked) => updateSetting("confirmActions", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Motor Tab */}
          {activeTab === "motor" && (
            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hand className="h-5 w-5" />
                    Motor Assistance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="dwell-click">Dwell Click</Label>
                      <p className="text-xs text-muted-foreground">Click by hovering for set time</p>
                    </div>
                    <Switch
                      id="dwell-click"
                      checked={settings.dwellClick}
                      onCheckedChange={(checked) => updateSetting("dwellClick", checked)}
                    />
                  </div>

                  {settings.dwellClick && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="dwell-time">Dwell Time</Label>
                        <Badge variant="secondary" className="rounded-full">
                          {settings.dwellTime}ms
                        </Badge>
                      </div>
                      <Slider
                        id="dwell-time"
                        value={[settings.dwellTime]}
                        onValueChange={([value]) => updateSetting("dwellTime", value)}
                        min={500}
                        max={3000}
                        step={100}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="sticky-keys">Sticky Keys</Label>
                      <p className="text-xs text-muted-foreground">Press modifier keys one at a time</p>
                    </div>
                    <Switch
                      id="sticky-keys"
                      checked={settings.stickyKeys}
                      onCheckedChange={(checked) => updateSetting("stickyKeys", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="slow-keys">Slow Keys</Label>
                      <p className="text-xs text-muted-foreground">Ignore brief key presses</p>
                    </div>
                    <Switch
                      id="slow-keys"
                      checked={settings.slowKeys}
                      onCheckedChange={(checked) => updateSetting("slowKeys", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="bounce-keys">Bounce Keys</Label>
                      <p className="text-xs text-muted-foreground">Ignore repeated key presses</p>
                    </div>
                    <Switch
                      id="bounce-keys"
                      checked={settings.bounceKeys}
                      onCheckedChange={(checked) => updateSetting("bounceKeys", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="mouse-keys">Mouse Keys</Label>
                      <p className="text-xs text-muted-foreground">Control mouse with keyboard</p>
                    </div>
                    <Switch
                      id="mouse-keys"
                      checked={settings.mouseKeys}
                      onCheckedChange={(checked) => updateSetting("mouseKeys", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="drag-assist">Drag Assistance</Label>
                      <p className="text-xs text-muted-foreground">Easier drag and drop operations</p>
                    </div>
                    <Switch
                      id="drag-assist"
                      checked={settings.dragAssist}
                      onCheckedChange={(checked) => updateSetting("dragAssist", checked)}
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
                      max={4}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Hover Delay */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hover-delay">Hover Delay</Label>
                      <Badge variant="secondary" className="rounded-full">
                        {settings.hoverDelay}ms
                      </Badge>
                    </div>
                    <Slider
                      id="hover-delay"
                      value={[settings.hoverDelay]}
                      onValueChange={([value]) => updateSetting("hoverDelay", value)}
                      min={0}
                      max={1000}
                      step={100}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === "language" && (
            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Languages className="h-5 w-5" />
                    Language & Localization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Interface Language</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value: string) => {
                        console.log("Language selection changed to:", value)
                        updateSetting("language", value)
                      }}
                      onOpenChange={(open) => {
                        console.log("Language select open state:", open)
                      }}
                    >
                      <SelectTrigger 
                        id="language" 
                        className="rounded-lg"
                        onClick={() => console.log("Language select trigger clicked")}
                      >
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg z-[80]" position="popper" sideOffset={4}>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="right-to-left">Right-to-Left Text</Label>
                      <p className="text-xs text-muted-foreground">For Arabic, Hebrew, and other RTL languages</p>
                    </div>
                    <Switch
                      id="right-to-left"
                      checked={settings.rightToLeft}
                      onCheckedChange={(checked) => updateSetting("rightToLeft", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="translation">Auto Translation</Label>
                      <p className="text-xs text-muted-foreground">Translate content to your preferred language</p>
                    </div>
                    <Switch
                      id="translation"
                      checked={settings.translation}
                      onCheckedChange={(checked) => updateSetting("translation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="simplified-language">Simplified Language</Label>
                      <p className="text-xs text-muted-foreground">Use simpler words and shorter sentences</p>
                    </div>
                    <Switch
                      id="simplified-language"
                      checked={settings.simplifiedLanguage}
                      onCheckedChange={(checked) => updateSetting("simplifiedLanguage", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5" />
                    Seizure Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="seizure-protection">Seizure Protection</Label>
                      <p className="text-xs text-muted-foreground">Reduce flashing and rapid changes</p>
                    </div>
                    <Switch
                      id="seizure-protection"
                      checked={settings.seizureProtection}
                      onCheckedChange={(checked) => updateSetting("seizureProtection", checked)}
                    />
                  </div>

                  {settings.seizureProtection && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="flash-threshold">Flash Threshold</Label>
                          <Badge variant="secondary" className="rounded-full">
                            {settings.flashThreshold} per second
                          </Badge>
                        </div>
                        <Slider
                          id="flash-threshold"
                          value={[settings.flashThreshold]}
                          onValueChange={([value]) => updateSetting("flashThreshold", value)}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="red-flash-reduction">Red Flash Reduction</Label>
                          <p className="text-xs text-muted-foreground">Specifically reduce red flashing content</p>
                        </div>
                        <Switch
                          id="red-flash-reduction"
                          checked={settings.redFlashReduction}
                          onCheckedChange={(checked) => updateSetting("redFlashReduction", checked)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Tab */}
          {activeTab === "navigation" && (
            <div className="space-y-6">
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="sticky-focus">Sticky Focus</Label>
                      <p className="text-xs text-muted-foreground">Keep focus visible longer</p>
                    </div>
                    <Switch
                      id="sticky-focus"
                      checked={settings.stickyFocus}
                      onCheckedChange={(checked) => updateSetting("stickyFocus", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    Custom Keyboard Shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Create custom keyboard shortcuts for frequently used actions
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Ctrl+Alt+H" className="text-sm" />
                      <Select>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-contrast">Toggle High Contrast</SelectItem>
                          <SelectItem value="text-size">Increase Text Size</SelectItem>
                          <SelectItem value="read-page">Read Page</SelectItem>
                          <SelectItem value="focus-mode">Toggle Focus Mode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      Add Shortcut
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Default Shortcuts:</h4>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Alt + A</span>
                        <span>Open Accessibility Panel</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alt + C</span>
                        <span>Toggle High Contrast</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alt + +</span>
                        <span>Increase Text Size</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alt + -</span>
                        <span>Decrease Text Size</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Motion Tab */}
          {activeTab === "motion" && (
            <div className="space-y-6">
              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5" />
                    Motion & Animation
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="parallax-disabled">Disable Parallax</Label>
                      <p className="text-xs text-muted-foreground">Remove parallax scrolling effects</p>
                    </div>
                    <Switch
                      id="parallax-disabled"
                      checked={settings.parallaxDisabled}
                      onCheckedChange={(checked) => updateSetting("parallaxDisabled", checked)}
                    />
                  </div>

                  {/* Animation Speed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animation-speed">Animation Speed</Label>
                      <Badge variant="secondary" className="rounded-full">
                        {settings.animationSpeed}x
                      </Badge>
                    </div>
                    <Slider
                      id="animation-speed"
                      value={[settings.animationSpeed]}
                      onValueChange={([value]) => updateSetting("animationSpeed", value)}
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Very Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Information Card */}
          <Card className="rounded-xl border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Comprehensive Accessibility</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                    These advanced accessibility features are designed to accommodate a wide range of disabilities and
                    preferences. All settings are automatically saved and synchronized across your devices. For
                    additional support or to report accessibility issues, please contact our dedicated accessibility
                    team.
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
