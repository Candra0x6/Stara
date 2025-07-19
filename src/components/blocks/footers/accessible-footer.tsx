"use client"

import { useState } from "react"
import { ChevronDown, Globe, Mail, Phone, Twitter, Facebook, Instagram, Linkedin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
]

const socialLinks = [
  { 
    name: 'Twitter', 
    icon: Twitter, 
    url: 'https://twitter.com/company',
    ariaLabel: 'Follow us on Twitter (opens in new tab)'
  },
  { 
    name: 'Facebook', 
    icon: Facebook, 
    url: 'https://facebook.com/company',
    ariaLabel: 'Follow us on Facebook (opens in new tab)'
  },
  { 
    name: 'Instagram', 
    icon: Instagram, 
    url: 'https://instagram.com/company',
    ariaLabel: 'Follow us on Instagram (opens in new tab)'
  },
  { 
    name: 'LinkedIn', 
    icon: Linkedin, 
    url: 'https://linkedin.com/company/company',
    ariaLabel: 'Follow us on LinkedIn (opens in new tab)'
  },
]

export default function AccessibleFooter() {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage)

  return (
    <footer 
      className="bg-background border-t border-border" 
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Skip link for footer navigation */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2 focus:rounded focus:underline"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Accessibility statement banner */}
        <div className="py-4 border-b border-border">
          <div className="flex items-center justify-center">
            <a 
              href="/accessibility-statement"
              className="text-accent hover:text-accent/80 focus:text-accent/80 font-medium underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              aria-label="View our accessibility statement (opens in new page)"
            >
              <span className="flex items-center gap-2">
                Accessibility Statement
                <ExternalLink size={16} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>

        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Links Section */}
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">
              Company
            </h2>
            <nav aria-label="Company links">
              <ul className="space-y-3">
                <li>
                  <a 
                    href="/about"
                    className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a 
                    href="/careers"
                    className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a 
                    href="/contact"
                    className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a 
                    href="/help"
                    className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Legal Section */}
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">
              Legal
            </h2>
            <nav aria-label="Legal links">
              <ul className="space-y-3">
                <li>
                  <a 
                    href="/terms"
                    className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="/privacy"
                    className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="/cookies"
                    className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">
              Contact Us
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-muted-foreground" aria-hidden="true" />
                <a 
                  href="tel:+1-555-123-4567"
                  className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  aria-label="Call us at +1-555-123-4567"
                >
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-muted-foreground" aria-hidden="true" />
                <a 
                  href="mailto:support@company.com"
                  className="text-muted-foreground hover:text-accent focus:text-accent underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  aria-label="Email us at support@company.com"
                >
                  support@company.com
                </a>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Business Hours:<br />
                  Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                  Saturday: 10:00 AM - 4:00 PM EST
                </p>
              </div>
            </div>
          </div>

          {/* Language & Social */}
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">
              Language & Social
            </h2>
            
            {/* Language Selector */}
            <div className="mb-6">
              <label 
                htmlFor="language-selector"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Select Language
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-background hover:bg-muted focus:bg-muted"
                    aria-label={`Current language: ${currentLanguage?.nativeName}. Click to change language`}
                    id="language-selector"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={16} aria-hidden="true" />
                      {currentLanguage?.nativeName}
                    </span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-[200px] bg-background border-border"
                  aria-label="Language options"
                >
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language.code}
                      onClick={() => setSelectedLanguage(language.code)}
                      className="cursor-pointer hover:bg-muted focus:bg-muted"
                      aria-label={`Switch to ${language.nativeName}`}
                    >
                      {language.nativeName}
                      {language.code === selectedLanguage && (
                        <span className="sr-only"> (current)</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Social Media Links */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Follow Us
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent focus:text-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded p-1 transition-colors"
                      aria-label={social.ariaLabel}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Company Name. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Made with accessibility in mind
              </p>
              <a 
                href="/accessibility-statement"
                className="text-sm text-accent hover:text-accent/80 focus:text-accent/80 underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                aria-label="View accessibility statement"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}