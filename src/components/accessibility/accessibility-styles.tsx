"use client"

import { useEffect } from "react"

export default function AccessibilityStyles() {
  useEffect(() => {
    // Inject comprehensive accessibility CSS
    const style = document.createElement("style")
    style.textContent = `
      /* Text and Font Adjustments */
      .accessibility-text {
        font-size: var(--accessibility-font-size, 16px) !important;
        line-height: var(--accessibility-line-height, 1.5) !important;
        letter-spacing: var(--accessibility-letter-spacing, 0px) !important;
        word-spacing: var(--accessibility-word-spacing, 0px) !important;
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
        filter: contrast(150%) brightness(110%);
      }

      .high-contrast * {
        border-color: hsl(var(--border)) !important;
        border-width: 2px !important;
      }

      .high-contrast button {
        border: 3px solid hsl(var(--border)) !important;
        font-weight: bold !important;
      }

      .high-contrast input, 
      .high-contrast textarea {
        border: 3px solid hsl(var(--border)) !important;
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

      /* Custom Colors */
      html[style*="--accessibility-bg-color"] {
        background-color: var(--accessibility-bg-color) !important;
        color: var(--accessibility-text-color) !important;
      }

      html[style*="--accessibility-bg-color"] a {
        color: var(--accessibility-link-color) !important;
      }

      html[style*="--accessibility-bg-color"] button {
        background-color: var(--accessibility-button-color) !important;
        color: var(--accessibility-bg-color) !important;
      }

      /* Dyslexia Font */
      .dyslexia-font * {
        font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important;
      }

      /* Reading Assistance */
      .reading-guide {
        position: relative;
      }

      .reading-guide p:hover::before {
        content: '';
        position: absolute;
        left: -10px;
        right: -10px;
        top: 0;
        bottom: 0;
        background: rgba(255, 255, 0, 0.2);
        border: 2px solid #ffcc00;
        border-radius: 4px;
        z-index: -1;
      }

      .reading-mask {
        position: relative;
      }

      .reading-mask p:not(:hover) {
        opacity: 0.6;
        transition: opacity 0.3s ease;
      }

      .reading-mask p:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 4px;
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
        box-shadow: 0 0 0 6px rgba(0, 95, 204, 0.3) !important;
      }

      /* Enhanced Focus Indicators */
      .enhanced-focus *:focus {
        outline: 3px solid #005fcc !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 6px rgba(0, 95, 204, 0.2) !important;
      }

      /* Simplified Interface */
      .simplified-interface {
        font-family: Arial, sans-serif !important;
      }

      .simplified-interface * {
        border-radius: 4px !important;
        box-shadow: none !important;
        background-image: none !important;
      }

      .simplified-interface button {
        background: #0066cc !important;
        color: white !important;
        border: 2px solid #004499 !important;
        padding: 12px 24px !important;
        font-size: 16px !important;
        font-weight: bold !important;
      }

      /* Focus Mode */
      .focus-mode .decoration,
      .focus-mode .sidebar,
      .focus-mode .advertisement,
      .focus-mode [role="complementary"] {
        display: none !important;
      }

      .focus-mode main {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 20px !important;
      }

      /* Distraction Free */
      .distraction-free * {
        animation: none !important;
        background-image: none !important;
        box-shadow: none !important;
      }

      .distraction-free .gradient,
      .distraction-free .shadow,
      .distraction-free .decoration {
        display: none !important;
      }

      /* Seizure Protection */
      .seizure-protection * {
        animation-duration: 2s !important;
        transition-duration: 0.5s !important;
      }

      .seizure-protection [data-flashing],
      .seizure-protection .flashing,
      .seizure-protection .blink {
        animation: none !important;
        opacity: 0.8 !important;
      }

      /* RTL Support */
      .rtl {
        direction: rtl !important;
        text-align: right !important;
      }

      .rtl * {
        direction: rtl !important;
      }

      /* Visual Enhancements */
      html {
        filter: 
          brightness(var(--accessibility-brightness, 100%))
          saturate(var(--accessibility-saturation, 100%));
        zoom: var(--accessibility-magnification, 100%);
      }

      /* Cursor Size Adjustments */
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

      html[style*="--accessibility-cursor-size: 3.5"] * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><path d="M3 3l14 35 10.5-10.5L63 3z" fill="black"/></svg>') 3 3, auto !important;
      }

      html[style*="--accessibility-cursor-size: 4"] * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M4 4l16 40 12-12 40-16z" fill="black"/></svg>') 4 4, auto !important;
      }

      /* Click Assistance */
      .click-assist button,
      .click-assist a,
      .click-assist [role="button"],
      .click-assist input,
      .click-assist select {
        min-height: 48px !important;
        min-width: 48px !important;
        padding: 16px !important;
        margin: 4px !important;
      }

      .click-assist button:hover,
      .click-assist a:hover,
      .click-assist [role="button"]:hover {
        transition-delay: 0.5s !important;
        transform: scale(1.05) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
      }

      /* Skip Links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 12px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
        font-weight: bold;
        font-size: 16px;
      }

      .skip-link:focus {
        top: 6px;
      }

      /* Sticky Focus */
      .sticky-focus *:focus {
        outline-width: 4px !important;
        outline-style: solid !important;
        outline-color: #ff6600 !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 0 8px rgba(255, 102, 0, 0.3) !important;
        transition: none !important;
      }

      /* Motor Assistance - Dwell Click */
      .dwell-click * {
        transition: all 0.3s ease !important;
      }

      .dwell-click *:hover {
        transform: scale(1.02) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      }

      /* Drag Assistance */
      .drag-assist [draggable="true"] {
        border: 2px dashed #0066cc !important;
        padding: 8px !important;
        margin: 4px !important;
      }

      .drag-assist [draggable="true"]:hover {
        background: rgba(0, 102, 204, 0.1) !important;
        cursor: grab !important;
      }

      .drag-assist [draggable="true"]:active {
        cursor: grabbing !important;
        opacity: 0.8 !important;
      }

      /* Media Controls */
      .pause-autoplay video,
      .pause-autoplay audio {
        autoplay: none !important;
      }

      .pause-autoplay video::before,
      .pause-autoplay audio::before {
        content: "▶ Click to play";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10;
      }

      /* Animation Speed Control */
      html[style*="--accessibility-animation-speed"] * {
        animation-duration: calc(var(--original-duration, 1s) / var(--accessibility-animation-speed, 1)) !important;
        transition-duration: calc(var(--original-duration, 0.3s) / var(--accessibility-animation-speed, 1)) !important;
      }

      /* Keyboard Navigation Enhancements */
      .keyboard-nav *:focus {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
        background: rgba(0, 102, 204, 0.1) !important;
      }

      .keyboard-nav button:focus,
      .keyboard-nav a:focus,
      .keyboard-nav input:focus,
      .keyboard-nav select:focus,
      .keyboard-nav textarea:focus {
        box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.3) !important;
      }

      /* Text-to-Speech Highlighting */
      .tts-highlight {
        background: linear-gradient(90deg, #ffff00 0%, #ffff00 100%) !important;
        color: #000 !important;
        padding: 2px 4px !important;
        border-radius: 2px !important;
        animation: tts-pulse 0.5s ease-in-out !important;
      }

      @keyframes tts-pulse {
        0% { background-color: #ffff00; }
        50% { background-color: #ffcc00; }
        100% { background-color: #ffff00; }
      }

      /* Voice Command Feedback */
      .voice-command-active::after {
        content: "🎤 Listening...";
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1000;
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }

      /* Magnification Lens */
      .magnifier-lens {
        position: fixed;
        width: 200px;
        height: 200px;
        border: 3px solid #0066cc;
        border-radius: 50%;
        background: white;
        z-index: 1000;
        pointer-events: none;
        transform: scale(2);
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      /* Color Blind Support */
      .colorblind-support {
        filter: 
          contrast(120%) 
          brightness(110%) 
          saturate(150%);
      }

      .colorblind-support .red {
        background-color: #ff0000 !important;
        border: 2px solid #000 !important;
      }

      .colorblind-support .green {
        background-color: #00ff00 !important;
        border: 2px solid #000 !important;
      }

      .colorblind-support .blue {
        background-color: #0000ff !important;
        border: 2px solid #fff !important;
      }

      /* Task Reminders */
      .task-reminder {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
      }

      @keyframes slideIn {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }

      /* Timeout Warnings */
      .timeout-warning {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff9800;
        color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        text-align: center;
        max-width: 400px;
      }

      /* Confirmation Dialogs */
      .confirm-action {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 3px solid #0066cc;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 1002;
        text-align: center;
        max-width: 500px;
      }

      .confirm-action button {
        margin: 8px !important;
        padding: 12px 24px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        border-radius: 4px !important;
        min-width: 100px !important;
      }

      /* Responsive Accessibility */
      @media (max-width: 768px) {
        .accessibility-text {
          font-size: calc(var(--accessibility-font-size, 16px) + 2px) !important;
        }

        .click-assist button,
        .click-assist a,
        .click-assist [role="button"] {
          min-height: 56px !important;
          min-width: 56px !important;
          padding: 20px !important;
        }

        .skip-link {
          font-size: 18px !important;
          padding: 16px 20px !important;
        }
      }

      /* Print Accessibility */
      @media print {
        .high-contrast * {
          color: #000 !important;
          background: #fff !important;
          border-color: #000 !important;
        }

        .dark-mode * {
          color: #000 !important;
          background: #fff !important;
        }

        .accessibility-text {
          font-size: 12pt !important;
          line-height: 1.6 !important;
        }
      }
    `

    document.head.appendChild(style)

    // Add keyboard event listeners for shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case "a":
            event.preventDefault()
            // Open accessibility panel
            // @ts-ignore
            document.querySelector('[aria-label="Open accessibility settings panel"]')?.click()
            break
          case "c":
            event.preventDefault()
            // Toggle high contrast
            document.documentElement.classList.toggle("high-contrast")
            break
          case "=":
          case "+":
            event.preventDefault()
            // Increase text size
            const currentSize = Number.parseInt(
              getComputedStyle(document.documentElement).getPropertyValue("--accessibility-font-size") || "16",
            )
            document.documentElement.style.setProperty(
              "--accessibility-font-size",
              `${Math.min(currentSize + 2, 32)}px`,
            )
            break
          case "-":
            event.preventDefault()
            // Decrease text size
            const currentSizeDecrease = Number.parseInt(
              getComputedStyle(document.documentElement).getPropertyValue("--accessibility-font-size") || "16",
            )
            document.documentElement.style.setProperty(
              "--accessibility-font-size",
              `${Math.max(currentSizeDecrease - 2, 10)}px`,
            )
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.head.removeChild(style)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return null
}
