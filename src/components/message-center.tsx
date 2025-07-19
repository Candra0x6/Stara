"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Clock, CheckCircle2, Building2, User } from "lucide-react"

interface Message {
  id: string
  from: "employer" | "system" | "user"
  sender: string
  company?: string
  content: string
  timestamp: string
  read: boolean
  type: "message" | "update" | "reminder"
  jobTitle?: string
}

const mockMessages: Message[] = [
  {
    id: "1",
    from: "employer",
    sender: "Sarah Johnson",
    company: "TechCorp Inc.",
    content:
      "Thank you for your application! We've reviewed your profile and would like to schedule a phone interview. Are you available next Tuesday at 2 PM?",
    timestamp: "2 hours ago",
    read: false,
    type: "message",
    jobTitle: "Senior Frontend Developer",
  },
  {
    id: "2",
    from: "system",
    sender: "Job Tracker",
    content: "Your application for UX Designer at InclusiveDesign Co. has been viewed by the hiring team.",
    timestamp: "1 day ago",
    read: true,
    type: "update",
    jobTitle: "UX Designer - Accessibility Focus",
  },
  {
    id: "3",
    from: "employer",
    sender: "Mike Chen",
    company: "Analytics Plus",
    content:
      "Hi! We received your application for the Data Analyst position. We're impressed with your background and would like to move forward with a technical assessment. Please find the details attached.",
    timestamp: "2 days ago",
    read: true,
    type: "message",
    jobTitle: "Data Analyst",
  },
  {
    id: "4",
    from: "system",
    sender: "Job Tracker",
    content:
      "Reminder: You have an interview scheduled for tomorrow at 10:00 AM with SupportFirst for the Customer Success Manager position.",
    timestamp: "3 days ago",
    read: true,
    type: "reminder",
    jobTitle: "Customer Success Manager",
  },
]

export default function MessageCenter() {
  const [messages, setMessages] = useState(mockMessages)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [filter, setFilter] = useState<"all" | "unread" | "employers">("all")

  const filteredMessages = messages.filter((message) => {
    if (filter === "unread") return !message.read
    if (filter === "employers") return message.from === "employer"
    return true
  })

  const unreadCount = messages.filter((m) => !m.read).length

  const markAsRead = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)))
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return

    const newMessage: Message = {
      id: Date.now().toString(),
      from: "user",
      sender: "You",
      content: replyText,
      timestamp: "Just now",
      read: true,
      type: "message",
      jobTitle: selectedMessage.jobTitle,
    }

    setMessages((prev) => [newMessage, ...prev])
    setReplyText("")
  }

  const getMessageIcon = (message: Message) => {
    switch (message.type) {
      case "update":
        return CheckCircle2
      case "reminder":
        return Clock
      default:
        return message.from === "employer" ? Building2 : User
    }
  }

  const getMessageColor = (message: Message) => {
    switch (message.type) {
      case "update":
        return "blue"
      case "reminder":
        return "amber"
      default:
        return message.from === "employer" ? "purple" : "emerald"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Message List */}
      <div className="lg:col-span-1">
        <Card className="rounded-2xl h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: "Unread" },
                { key: "employers", label: "Employers" },
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterOption.key as any)}
                  className="rounded-full text-xs"
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-y-auto max-h-[480px]">
            <div className="space-y-1">
              {filteredMessages.map((message, index) => {
                const Icon = getMessageIcon(message)
                const color = getMessageColor(message)

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (!message.read) markAsRead(message.id)
                    }}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                      selectedMessage?.id === message.id
                        ? "bg-blue-50 dark:bg-blue-950/20 border-l-blue-500"
                        : !message.read
                          ? "bg-amber-50 dark:bg-amber-950/20 border-l-amber-500"
                          : "border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {message.from === "employer" ? message.company : message.sender}
                          </p>
                          {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>

                        {message.jobTitle && <p className="text-xs text-muted-foreground mb-1">{message.jobTitle}</p>}

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{message.content}</p>

                        <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Detail */}
      <div className="lg:col-span-2">
        <Card className="rounded-2xl h-full">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {selectedMessage.sender.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{selectedMessage.sender}</h3>
                      {selectedMessage.company && (
                        <Badge variant="outline" className="rounded-full text-xs">
                          {selectedMessage.company}
                        </Badge>
                      )}
                    </div>
                    {selectedMessage.jobTitle && (
                      <p className="text-sm text-muted-foreground mb-1">Re: {selectedMessage.jobTitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{selectedMessage.timestamp}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="prose prose-sm max-w-none"
                >
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                </motion.div>
              </CardContent>

              {/* Reply Section */}
              {selectedMessage.from === "employer" && (
                <div className="p-6 border-t">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="rounded-lg min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a message</h3>
                <p className="text-muted-foreground">Choose a message from the list to view details</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
