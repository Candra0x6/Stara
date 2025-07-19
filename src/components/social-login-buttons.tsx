"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Chrome, Facebook, Github, Linkedin } from "lucide-react"

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: string) => void
  isLoading?: boolean
}

export default function SocialLoginButtons({ onSocialLogin, isLoading }: SocialLoginButtonsProps) {
  const socialProviders = [
    {
      id: "google",
      name: "Continue with Google",
      icon: Chrome,
      color: "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600",
      bgColor: "bg-white",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="">
        {socialProviders.map((provider, index) => {
          const Icon = provider.icon
          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                onClick={() => onSocialLogin(provider.id)}
                disabled={isLoading}
                className={`w-full rounded-xl ${provider.bgColor} ${provider.color} transition-all duration-200 border-border`}
                aria-label={`Sign in with ${provider.name}`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {provider.name}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
