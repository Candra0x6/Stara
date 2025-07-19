"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SocialLoginButtons from "@/components/social-login-buttons"
import RoleSelector from "@/components/role-selector"
import { Eye, EyeOff, Mail, User, CheckCircle, AlertCircle, Loader2, Shield, Accessibility } from "lucide-react"
import BackButton from "@/components/blocks/navigation/back-button"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import Link from "next/link"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: string
  referralCode: string
  agreeToTerms: boolean
  agreeToPrivacy: boolean
  subscribeNewsletter: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function AuthPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job-seeker",
    referralCode: "",
    agreeToTerms: false,
    agreeToPrivacy: false,
    subscribeNewsletter: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/profile-setup')
    }
  }, [isAuthenticated, authLoading, router])

  // Refs for auto-focus
  const emailRef = useRef<HTMLInputElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)

  // Auto-focus on tab change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "signin" && emailRef.current) {
        emailRef.current.focus()
      } else if (activeTab === "signup" && firstNameRef.current) {
        firstNameRef.current.focus()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [activeTab])

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    strength = Object.values(checks).filter(Boolean).length

    return {
      strength,
      checks,
      label: strength < 2 ? "Weak" : strength < 4 ? "Medium" : "Strong",
      color: strength < 2 ? "red" : strength < 4 ? "yellow" : "green",
    }
  }

  // Form validation
  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (activeTab === "signup") {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms of service"
      if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = "You must agree to the privacy policy"
      if (!captchaVerified) newErrors.captcha = "Please complete the security verification"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (activeTab === "signup" && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setSuccessMessage("")

    try {
      if (activeTab === "signup") {
        // Register new user
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            role: formData.role.toUpperCase().replace('-', '_'), // Convert 'job-seeker' to 'JOB_SEEKER'
            agreeToTerms: formData.agreeToTerms,
            agreeToPrivacy: formData.agreeToPrivacy,
            subscribeNewsletter: formData.subscribeNewsletter,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.details) {
            // Handle validation errors
            const newErrors: FormErrors = {}
            data.details.forEach((error: any) => {
              if (error.path && error.path.length > 0) {
                newErrors[error.path[0]] = error.message
              }
            })
            setErrors(newErrors)
          } else {
            setErrors({ submit: data.error || 'Registration failed' })
          }
          return
        }

        setSuccessMessage("Account created successfully! Signing you in...")
        
        // Automatically sign in the user
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (signInResult?.error) {
          setErrors({ submit: 'Account created but failed to sign in. Please sign in manually.' })
          setActiveTab("signin")
        } else if (signInResult?.ok) {
          setSuccessMessage("Account created and signed in successfully! Redirecting...")
          router.push('/profile-setup')
        }
        
      } else {
        // Sign in existing user
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setErrors({ submit: 'Invalid email or password' })
        } else if (result?.ok) {
          setSuccessMessage("Welcome back! Redirecting...")
          
          // Handle remember me by setting a longer session
          if (rememberMe) {
            // Session duration is handled by NextAuth configuration
            document.cookie = `remember-me=true; max-age=${30 * 24 * 60 * 60}; path=/` // 30 days
          }
          
          router.push('/profile-setup')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ submit: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      const result = await signIn(provider, {
        callbackUrl: '/profile-setup',
        redirect: false,
      })
      
      if (result?.error) {
        setErrors({ submit: `Failed to sign in with ${provider}. Please try again.` })
      } else if (result?.ok) {
        setSuccessMessage(`Signing in with ${provider}...`)
        // Check if user needs profile setup
        const session = await getSession()
        if (session?.user) {
          router.push('/jobs')
        } else {
          router.push('/profile-setup')
        }
      }
    } catch (error) {
      setErrors({ submit: `Failed to sign in with ${provider}` })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = async (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Check email availability during signup
    if (field === 'email' && typeof value === 'string' && activeTab === 'signup' && value.includes('@')) {
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value }),
        })
        const data = await response.json()
        
        if (data.exists) {
          setErrors(prev => ({ ...prev, email: 'An account with this email already exists' }))
        }
      } catch (error) {
        // Silently handle email check errors
        console.error('Email check error:', error)
      }
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
      <BackButton title="AI Job Matcher" subtitle="Sign In or Sign Up" />
        <Card className="rounded-2xl border-2 p-0 py-4 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center ">


            <CardTitle className="text-2xl font-bold bg-foreground bg-clip-text text-transparent">
              AI Job Matcher
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {activeTab === "signin" ? "Welcome back! Sign in to your account" : "Create your account to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent className="">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="signin" className="rounded-lg">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <TabsContent value="signin" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      ref={emailRef}
                      id="signin-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      className={`rounded-lg ${errors.email ? "border-red-500" : ""}`}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Enter your password"
                        className={`rounded-lg pr-10 ${errors.password ? "border-red-500" : ""}`}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 border-r border-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <Link href="/auth/forgot-password">
                        <Button variant="link" className="px-0 text-sm">
                          Forgot password?
                        </Button>
                      </Link>
                    </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-2 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        ref={firstNameRef}
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        className={`rounded-lg ${errors.firstName ? "border-red-500" : ""}`}
                        autoComplete="given-name"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                        className={`rounded-lg ${errors.lastName ? "border-red-500" : ""}`}
                        autoComplete="family-name"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john.doe@example.com"
                      className={`rounded-lg ${errors.email ? "border-red-500" : ""}`}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Create a strong password"
                        className={`rounded-lg pr-10 ${errors.password ? "border-red-500" : ""}`}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 border-r border-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color === "red"
                                  ? "bg-red-500"
                                  : passwordStrength.color === "yellow"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${passwordStrength.color === "red"
                                ? "text-red-600"
                                : passwordStrength.color === "yellow"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                            <div
                              key={key}
                              className={`flex items-center gap-1 ${passed ? "text-green-600" : "text-gray-400"}`}
                            >
                              <CheckCircle className="h-3 w-3" />
                              {key === "length"
                                ? "8+ characters"
                                : key === "uppercase"
                                  ? "Uppercase"
                                  : key === "lowercase"
                                    ? "Lowercase"
                                    : key === "numbers"
                                      ? "Numbers"
                                      : "Special chars"}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Confirm your password"
                        className={`rounded-lg pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 border-r border-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <RoleSelector selectedRole={formData.role} onRoleChange={(role) => handleInputChange("role", role)} />

                  {/* Terms and Privacy Agreement */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="agreeToTerms" 
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                        className={errors.agreeToTerms ? "border-red-500" : ""}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                        I agree to the{" "}
                        <Button variant="link" className="p-0 h-auto text-sm underline">
                          Terms of Service
                        </Button>
                      </Label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-600 flex items-center gap-1 ml-6">
                        <AlertCircle className="h-3 w-3" />
                        {errors.agreeToTerms}
                      </p>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="agreeToPrivacy" 
                        checked={formData.agreeToPrivacy}
                        onCheckedChange={(checked) => handleInputChange("agreeToPrivacy", checked)}
                        className={errors.agreeToPrivacy ? "border-red-500" : ""}
                      />
                      <Label htmlFor="agreeToPrivacy" className="text-sm leading-relaxed">
                        I agree to the{" "}
                        <Button variant="link" className="p-0 h-auto text-sm underline">
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>
                    {errors.agreeToPrivacy && (
                      <p className="text-sm text-red-600 flex items-center gap-1 ml-6">
                        <AlertCircle className="h-3 w-3" />
                        {errors.agreeToPrivacy}
                      </p>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="subscribeNewsletter" 
                        checked={formData.subscribeNewsletter}
                        onCheckedChange={(checked) => handleInputChange("subscribeNewsletter", checked)}
                      />
                      <Label htmlFor="subscribeNewsletter" className="text-sm leading-relaxed text-muted-foreground">
                        Subscribe to our newsletter for job updates and tips (optional)
                      </Label>
                    </div>
                  </div>


                </TabsContent>

                {/* Submit Button */}
                <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {activeTab === "signin" ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      {activeTab === "signin" ? <Mail className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
                      {activeTab === "signin" ? "Sign In" : "Create Account"}
                    </>
                  )}
                </Button>

                {/* Error/Success Messages */}
                <AnimatePresence>
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert className="rounded-lg border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{errors.submit}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert className="rounded-lg border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Social Login */}
              <SocialLoginButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />

              {/* Auth Mode Switch */}
              <div className="text-center pt-4 border-t mt-6">
                <p className="text-xs text-muted-foreground mb-2">
                  Using NextAuth authentication
                </p>
                <Link href="/auth/api">
                  <Button variant="outline" size="sm" className="text-xs">
                    Switch to API Mode
                  </Button>
                </Link>
              </div>
            </Tabs>

            {/* Accessibility Statement */}
            <div className="text-center pt-4 border-t">
              <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">
                <Accessibility className="h-3 w-3 mr-1" />
                Accessibility Statement
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
