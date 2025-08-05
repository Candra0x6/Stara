"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState, useRef, useEffect } from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  FileText,
  User,
  Lightbulb,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  suggestions?: string[]
  isTyping?: boolean
}

const quickPrompts = [
  {
    id: "improve-bullet",
    title: "Improve Bullet Point",
    description: "Make this more impactful for a tech role",
    icon: Zap,
    prompt: "Make this bullet point more impactful and result-oriented for a software developer position:",
  },
  {
    id: "write-summary",
    title: "Write Summary",
    description: "Generate a professional summary",
    icon: FileText,
    prompt: "Write a compelling professional summary for a frontend developer with 5+ years of experience:",
  },
  {
    id: "optimize-ats",
    title: "ATS Optimize",
    description: "Optimize for applicant tracking systems",
    icon: Bot,
    prompt: "Optimize this resume section for ATS compatibility and keyword matching:",
  },
  {
    id: "startup-tone",
    title: "Startup Tone",
    description: "Adjust tone for startup applications",
    icon: Lightbulb,
    prompt: "Rewrite this experience to appeal to startup companies and emphasize innovation:",
  },
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content:
        "👋 Hi! I'm your AI resume assistant. I can help you write compelling bullet points, optimize for ATS, adjust tone for different companies, and improve your overall resume content. What would you like to work on?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateAIResponse(content),
        timestamp: new Date(),
        suggestions: ["Make it more quantified", "Add technical keywords", "Emphasize leadership", "Focus on impact"],
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (prompt: string): string => {
    // Mock AI responses based on prompt type
    if (prompt.toLowerCase().includes("bullet point") || prompt.toLowerCase().includes("impactful")) {
      return `Here's an improved version of your bullet point:

**Original:** "Worked on frontend development projects"

**Improved:** "Led development of 3 high-traffic React applications serving 50K+ daily users, resulting in 40% improved user engagement and 25% faster page load times"

**Key improvements:**
• Added specific metrics (50K+ users, 40%, 25%)
• Used action verb "Led" instead of "Worked"
• Included business impact (user engagement)
• Mentioned specific technology (React)

Would you like me to help improve another bullet point?`
    }

    if (prompt.toLowerCase().includes("summary") || prompt.toLowerCase().includes("professional")) {
      return `Here's a compelling professional summary for a frontend developer:

**Professional Summary:**
"Results-driven Frontend Developer with 5+ years of experience building scalable, accessible web applications using React, TypeScript, and modern JavaScript frameworks. Proven track record of improving user experience metrics by 30%+ and leading cross-functional teams to deliver high-quality products. Passionate about creating inclusive digital experiences and mentoring junior developers. Seeking to leverage technical expertise and leadership skills in a senior frontend role at an innovative tech company."

**Why this works:**
• Starts with years of experience
• Mentions specific technologies
• Includes quantified achievements
• Shows leadership and soft skills
• Ends with clear career objective

Need any adjustments to match your specific background?`
    }

    return `I'd be happy to help you with that! Could you provide more specific details about what you'd like me to work on? For example:

• Share the specific text you want me to improve
• Tell me about the role you're targeting
• Let me know what aspect needs the most help

The more context you provide, the better I can tailor my suggestions to your needs.`
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="h-full flex flex-col bg-card border-l accessibility-text click-assist" role="complementary" aria-label="AI Assistant">
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="h-4 w-4" />
          AI Assistant
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs"
          >
            <Sparkles className="h-2 w-2 mr-1" />
            GPT-4
          </Badge>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback
                  className={
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  }
                >
                  {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              <div className={`flex-1 max-w-[80%] ${message.type === "user" ? "text-right" : ""}`}>
                <div
                  className={`rounded-2xl p-3 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white ml-auto"
                      : message.type === "system"
                        ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800"
                        : "bg-muted"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>

                {message.type === "assistant" && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 rounded-md"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 rounded-md">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 rounded-md">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 rounded-md">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {message.suggestions && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs rounded-full bg-transparent"
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-t">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickPrompts.map((prompt) => {
            const Icon = prompt.icon
            return (
              <Button
                key={prompt.id}
                variant="outline"
                size="sm"
                className="h-auto p-3 text-left rounded-lg bg-transparent"
                onClick={() => handleQuickPrompt(prompt.prompt)}
              >
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-xs">{prompt.title}</div>
                    <div className="text-xs text-muted-foreground">{prompt.description}</div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask me to improve your resume content..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="min-h-[60px] rounded-lg resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(inputValue)
              }
            }}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</div>
      </div>
    </div>
  )
}
