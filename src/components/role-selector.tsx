"use client"

import type React from "react"

import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Building2, Users, CheckCircle } from "lucide-react"

interface Role {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  features: string[]
  popular?: boolean
}

interface RoleSelectorProps {
  selectedRole: string
  onRoleChange: (roleId: string) => void
}

const roles: Role[] = [
  {
    id: "job-seeker",
    title: "Job Seeker",
    description: "Find your next opportunity with AI-powered matching",
    icon: Briefcase,
    features: ["AI Job Matching", "Application Tracking", "Resume Builder", "Interview Prep"],
    popular: true,
  },
  {
    id: "employer",
    title: "Employer",
    description: "Find the perfect candidates for your team",
    icon: Building2,
    features: ["Post Jobs", "Candidate Search", "ATS Integration", "Analytics Dashboard"],
  },

]

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-start">
        <p className="text-sm text-muted-foreground">I am a...*</p>
      </div>

      <div className="grid gap-2">
        {roles.map((role, index) => {
          const Icon = role.icon
          const isSelected = selectedRole === role.id

          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 rounded-xl border-2 p-0 ${
                  isSelected
                    ? "border-primary bg-primary shadow-md"
                    : "border-border hover:border-primary hover:shadow-sm"
                }`}
                onClick={() => onRoleChange(role.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Select ${role.title} role`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onRoleChange(role.id)
                  }
                }}
              >
                <CardContent className="p-2 ">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? " text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className={`flex-1 min-w-0 ${isSelected ? "text-white" : "text-foreground  "}`}>
                      <div className="flex items-center ">
                        <h4 className={`font-medium ${isSelected ? "text-white" : "text-foreground  "}`}>
                          {role.title}
                        </h4>
                        
                      </div>
                      <p className={`text-sm  ${isSelected ? "text-white" : "text-foreground  "}`}>{role.description}</p>

                  
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
