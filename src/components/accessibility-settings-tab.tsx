"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Settings, Volume2, Eye, Globe, Monitor, Accessibility, Save, CheckCircle, RotateCcw } from "lucide-react"

interface AccessibilitySettings {
  // Visual Settings
  theme: "light" | "dark" | "system" | "high-contrast"
  fontSize: number
  fontFamily: string
  reducedMotion: boolean
  highContrast: boolean
  colorBlindSupport: boolean

  // Audio Settings
  soundEnabled: boolean
  soundVolume: number
  screenReaderSupport: boolean

  // Navigation Settings
  keyboardNavigation: boolean
  focusIndicators: boolean
  skipLinks: boolean

  // Language & Localization
  language: string
  dateFormat: string
  timeFormat: "12h" | "24h"

  // Interface Settings
  compactMode: boolean
  tooltips: boolean
  animations: boolean
  autoSave: boolean
}

const mockSettings: AccessibilitySettings = {
  theme: "system",
  fontSize: 16,
  fontFamily: "system",
  reducedMotion: false,
  highContrast: false,
  colorBlindSupport: true,
  soundEnabled: true,
  soundVolume: 75,
  screenReaderSupport: true,
  keyboardNavigation: true,
  focusIndicators: true,
  skipLinks: true,
  language: "en",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  compactMode: false,
  tooltips: true,
  animations: true,
  autoSave: true,
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
]

const fontFamilies = [
  { value: "system", label: "System Default" },
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "arial", label: "Arial" },
  { value: "dyslexic", label: "OpenDyslexic" },
]

const themes = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "system", label: "System", icon: "💻" },
  { value: "high-contrast", label: "High Contrast", icon: "⚫" },
]

export default function AccessibilitySettingsTab() {
  const [settings, setSettings] = useState<AccessibilitySettings>(mockSettings)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setIsEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const resetToDefaults = () => {
    setSettings(mockSettings)
  }

  const selectedLanguage = languages.find((lang) => lang.code === settings.language)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Accessibility Settings</h2>
                {saved && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-emerald-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Saved</span>
                  </motion.div>
                )}
              </div>
              <p className="text-muted-foreground mb-4">
                Customize your interface to match your accessibility needs and preferences.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {selectedLanguage?.flag} {selectedLanguage?.name}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {settings.theme} theme
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {settings.fontSize}px font
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="rounded-xl bg-transparent"
                disabled={!isEditing}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="rounded-xl">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Settings */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <Button
                    key={theme.value}
                    variant={settings.theme === theme.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting("theme", theme.value as any)}
                    disabled={!isEditing}
                    className="rounded-lg justify-start bg-transparent"
                  >
                    <span className="mr-2">{theme.icon}</span>
                    {theme.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting("fontSize", value)}
                min={12}
                max={24}
                step={1}
                disabled={!isEditing}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Small (12px)</span>
                <span>Large (24px)</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Font Family</Label>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => updateSetting("fontFamily", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Color Blind Support</Label>
                  <p className="text-sm text-muted-foreground">Enhanced color differentiation</p>
                </div>
                <Switch
                  checked={settings.colorBlindSupport}
                  onCheckedChange={(checked) => updateSetting("colorBlindSupport", checked)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio & Navigation Settings */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Audio & Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Enable audio feedback</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                  disabled={!isEditing}
                />
              </div>

              {settings.soundEnabled && (
                <div className="space-y-3">
                  <Label>Sound Volume: {settings.soundVolume}%</Label>
                  <Slider
                    value={[settings.soundVolume]}
                    onValueChange={([value]) => updateSetting("soundVolume", value)}
                    min={0}
                    max={100}
                    step={5}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Screen Reader Support</Label>
                  <p className="text-sm text-muted-foreground">Optimize for screen readers</p>
                </div>
                <Switch
                  checked={settings.screenReaderSupport}
                  onCheckedChange={(checked) => updateSetting("screenReaderSupport", checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Keyboard Navigation</Label>
                  <p className="text-sm text-muted-foreground">Enhanced keyboard shortcuts</p>
                </div>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Focus Indicators</Label>
                  <p className="text-sm text-muted-foreground">Visible focus outlines</p>
                </div>
                <Switch
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) => updateSetting("focusIndicators", checked)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Skip Links</Label>
                  <p className="text-sm text-muted-foreground">Quick navigation shortcuts</p>
                </div>
                <Switch
                  checked={settings.skipLinks}
                  onCheckedChange={(checked) => updateSetting("skipLinks", checked)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language & Localization */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting("language", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => updateSetting("dateFormat", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select
                value={settings.timeFormat}
                onValueChange={(value) => updateSetting("timeFormat", value as "12h" | "24h")}
                disabled={!isEditing}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interface Settings */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Interface Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Tooltips</Label>
                <p className="text-sm text-muted-foreground">Display helpful tooltips</p>
              </div>
              <Switch
                checked={settings.tooltips}
                onCheckedChange={(checked) => updateSetting("tooltips", checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">Enable smooth animations</p>
              </div>
              <Switch
                checked={settings.animations}
                onCheckedChange={(checked) => updateSetting("animations", checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save</Label>
                <p className="text-sm text-muted-foreground">Automatically save changes</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting("autoSave", checked)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accessibility Notice */}
      <Card className="rounded-2xl border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Accessibility className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Accessibility Commitment</h3>
              <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                We're committed to making our platform accessible to everyone. These settings help customize your
                experience to match your needs. If you encounter any accessibility issues or need additional
                accommodations, please contact our support team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
