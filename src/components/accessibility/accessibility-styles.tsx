"use client"

import { useEffect } from "react"

export default function AccessibilityStyles() {
  useEffect(() => {
    // Inject accessibility CSS
    const style = document.createElement("style")
    style.textContent = `
      /* Text and Font Adjustments */
      .accessibility-text {
        font-size: var(--accessibility-font-size, 16px) !important;
        line-height: var(--accessibility-line-height, 1.5) !important;
        letter-spacing: var(--accessibility-letter-spacing, 0px) !important;
        font-family: var(--accessibility-font-family, inherit) !important;
      }

      /* High Contrast Mode */
      .high-contrast {
        --background: 0 0% 100%;
        --foreground: 0 0% 0%;
        --card: 0 0% 100%;
        --card-foreground: 0 0% 0%;
        --popover: 0 0% 100%;
        --popover-foreground: 0 0% 0%;
        --primary: 0 0% 0%;
        --primary-foreground: 0 0% 100%;
        --secondary: 0 0% 90%;
        --secondary-foreground: 0 0% 0%;
        --muted: 0 0% 90%;
        --muted-foreground: 0 0% 20%;
        --accent: 0 0% 90%;
        --accent-foreground: 0 0% 0%;
        --destructive: 0 84% 37%;
        --destructive-foreground: 0 0% 100%;
        --border: 0 0% 50%;
        --input: 0 0% 90%;
        --ring: 0 0% 0%;
      }

      .high-contrast * {
        border-color: hsl(var(--border)) !important;
      }

      .high-contrast button {
        border: 2px solid hsl(var(--border)) !important;
      }

      .high-contrast input, 
      .high-contrast textarea {
        border: 2px solid hsl(var(--border)) !important;
        background: hsl(var(--background)) !important;
      }

      /* Dark Mode */
      .dark-mode {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;
        --card: 222.2 84% 4.9%;
        --card-foreground: 210 40% 98%;
        --popover: 222.2 84% 4.9%;
        --popover-foreground: 210 40% 98%;
        --primary: 210 40% 98%;
        --primary-foreground: 222.2 84% 4.9%;
        --secondary: 217.2 32.6% 17.5%;
        --secondary-foreground: 210 40% 98%;
        --muted: 217.2 32.6% 17.5%;
        --muted-foreground: 215 20.2% 65.1%;
        --accent: 217.2 32.6% 17.5%;
        --accent-foreground: 210 40% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 210 40% 98%;
        --border: 217.2 32.6% 17.5%;
        --input: 217.2 32.6% 17.5%;
        --ring: 212.7 26.8% 83.9%;
      }

      /* Dyslexia Font */
      .dyslexia-font * {
        font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important;
      }

      /* Reduced Motion */
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

      /* Screen Reader Mode */
      .screen-reader-mode {
        --focus-ring-width: 4px;
        --focus-ring-color: #005fcc;
      }

      .screen-reader-mode *:focus {
        outline: var(--focus-ring-width) solid var(--focus-ring-color) !important;
        outline-offset: 2px !important;
      }

      /* Enhanced Focus Indicators */
      .enhanced-focus *:focus {
        outline: 3px solid #005fcc !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 6px rgba(0, 95, 204, 0.2) !important;
      }

      /* Cursor Size */
      .cursor-large {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M2 2l8 20 6-6 20-8z" fill="black"/></svg>') 2 2, auto !important;
      }

      .cursor-extra-large {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M3 3l12 30 9-9 30-12z" fill="black"/></svg>') 3 3, auto !important;
      }

      /* Click Assistance */
      .click-assist button,
      .click-assist a,
      .click-assist [role="button"] {
        min-height: 44px !important;
        min-width: 44px !important;
        padding: 12px !important;
      }

      .click-assist button:hover,
      .click-assist a:hover,
      .click-assist [role="button"]:hover {
        transition-delay: 0.3s !important;
      }

      /* Skip Links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      }

      .skip-link:focus {
        top: 6px;
      }

      /* Media Controls */
      .pause-autoplay video,
      .pause-autoplay audio {
        autoplay: none !important;
      }

      .hide-flashing [data-flashing],
      .hide-flashing .flashing {
        animation: none !important;
        opacity: 0.8 !important;
      }

      /* Apply cursor size based on setting */
      html[style*="--accessibility-cursor-size: 1.5"] * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M2 2l6 15 4.5-4.5L27.5 2z" fill="black"/></svg>') 2 2, auto !important;
      }

      html[style*="--accessibility-cursor-size: 2"] * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M2 2l8 20 6-6 20-8z" fill="black"/></svg>') 2 2, auto !important;
      }

      html[style*="--accessibility-cursor-size: 2.5"] * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M2 2l10 25 7.5-7.5L44.5 2z" fill="black"/></svg>') 2 2, auto !important;
      }

      html[style*="--accessibility-cursor-size: 3"] * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M3 3l12 30 9-9 30-12z" fill="black"/></svg>') 3 3, auto !important;
      }
    `

    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}
