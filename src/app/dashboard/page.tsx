'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Mail, 
  Calendar, 
  Briefcase, 
  Settings, 
  LogOut,
  UserCircle,
  Bell,
  Search,
  TrendingUp,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useApiSession } from "@/hooks/use-api-session"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from 'next-auth/react'
import { clearRememberMe } from '@/lib/session'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  avatar?: string
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  profile?: {
    phoneNumber?: string
    location?: string
    bio?: string
    skills?: string[]
    experience?: string
    education?: string[]
  }
}

export default function DashboardPage() {
  const { user: nextAuthUser, isLoading: nextAuthLoading } = useAuth()
  const { authenticated: apiAuthenticated, isLoading: apiLoading, user: apiUser, logout: apiLogout } = useApiSession()
  const router = useRouter()
  
  console.log(nextAuthUser)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'nextauth' | 'api' | 'none'>('none')

  // Determine which authentication system is active
  useEffect(() => {
    if (!nextAuthLoading && !apiLoading) {
      if (nextAuthUser) {
        setAuthMode('nextauth')
      } else if (apiAuthenticated && apiUser) {
        setAuthMode('api')
      } else {
        setAuthMode('none')
        router.push('/auth')
      }
    }
  }, [nextAuthUser, apiAuthenticated, nextAuthLoading, apiLoading, router, apiUser])

  console.log(nextAuthUser, "form api", apiUser)
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (authMode === 'none') return

      setIsLoadingProfile(true)
      setError(null)

      try {
        if (authMode === 'nextauth' && nextAuthUser) {
          setUserProfile({
            id: nextAuthUser.id || '',
            firstName: nextAuthUser.name?.split(' ')[0] || '',
            lastName: nextAuthUser.name?.split(' ').slice(1).join(' ') || '',
            email: nextAuthUser.email || '',
            role: 'JOB_SEEKER', // Default role
            avatar: nextAuthUser.image,
            isEmailVerified: nextAuthUser.emailVerified || false,
            createdAt: new Date().toISOString(),
          })
        } else if (authMode === 'api' && apiUser) {
          // For API auth, fetch detailed profile
          const response = await fetch('/api/user/profile')
          if (!response.ok) {
            throw new Error('Failed to fetch profile')
          }
          const profileData = await response.json()
          setUserProfile(profileData.user)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to load profile data')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [authMode, nextAuthUser, apiUser])

  const handleLogout = async () => {
    try {
      if (authMode === 'nextauth') {
        clearRememberMe()
        await signOut({ callbackUrl: '/auth' })
      } else if (authMode === 'api') {
        await apiLogout()
        router.push('/auth')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatRole = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'JOB_SEEKER':
        return 'bg-blue-100 text-blue-800'
      case 'EMPLOYER':
        return 'bg-green-100 text-green-800'
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (nextAuthLoading || apiLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Unable to load user profile. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">AI Job Matcher</h1>
              <Badge variant="outline" className="text-xs">
                {authMode === 'nextauth' ? 'NextAuth' : 'API'} Mode
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback>{getInitials(userProfile.firstName, userProfile.lastName)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline">
                  {userProfile.firstName} {userProfile.lastName}
                </span>
              </div>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="text-lg">
                    {getInitials(userProfile.firstName, userProfile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {userProfile.firstName} {userProfile.lastName}
                </CardTitle>
                <CardDescription className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userProfile.email}
                  </div>
                  <Badge className={getRoleColor(userProfile.role)}>
                    {formatRole(userProfile.role)}
                  </Badge>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email Verified</span>
                  <div className="flex items-center gap-1">
                    {userProfile.isEmailVerified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span>{new Date(userProfile.createdAt).toLocaleDateString()}</span>
                </div>

                {userProfile.lastLoginAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Login</span>
                    <span>{new Date(userProfile.lastLoginAt).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <Link href="/profile">
                    <Button variant="outline" className="w-full">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  
                  <Link href="/profile-setup">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Complete Setup
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Welcome Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Welcome to AI Job Matcher
                    </CardTitle>
                    <CardDescription>
                      Your personalized job matching dashboard powered by AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Job Matches
                        </h3>
                        <p className="text-2xl font-bold text-primary">12</p>
                        <p className="text-sm text-muted-foreground">New matches this week</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Applications
                        </h3>
                        <p className="text-2xl font-bold text-primary">5</p>
                        <p className="text-sm text-muted-foreground">Active applications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Get started with these common tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/jobs">
                        <Button variant="outline" className="w-full h-auto p-4 justify-start">
                          <div className="flex items-center gap-3">
                            <Search className="h-5 w-5" />
                            <div className="text-left">
                              <p className="font-medium">Browse Jobs</p>
                              <p className="text-sm text-muted-foreground">Find your next opportunity</p>
                            </div>
                          </div>
                        </Button>
                      </Link>

                      <Link href="/cv-builder">
                        <Button variant="outline" className="w-full h-auto p-4 justify-start">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5" />
                            <div className="text-left">
                              <p className="font-medium">Build CV</p>
                              <p className="text-sm text-muted-foreground">Create your resume</p>
                            </div>
                          </div>
                        </Button>
                      </Link>

                      <Link href="/tracker">
                        <Button variant="outline" className="w-full h-auto p-4 justify-start">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5" />
                            <div className="text-left">
                              <p className="font-medium">Application Tracker</p>
                              <p className="text-sm text-muted-foreground">Track your progress</p>
                            </div>
                          </div>
                        </Button>
                      </Link>

                      <Link href="/profile-setup">
                        <Button variant="outline" className="w-full h-auto p-4 justify-start">
                          <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5" />
                            <div className="text-left">
                              <p className="font-medium">Complete Profile</p>
                              <p className="text-sm text-muted-foreground">Improve your matches</p>
                            </div>
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest actions and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Account Created</p>
                          <p className="text-sm text-muted-foreground">
                            Welcome to AI Job Matcher! Your account has been successfully created.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(userProfile.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {!userProfile.isEmailVerified && (
                        <div className="flex items-center gap-3 p-3 border rounded-lg border-orange-200 bg-orange-50">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium">Email Verification Pending</p>
                            <p className="text-sm text-muted-foreground">
                              Please check your email and verify your account to access all features.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Authentication Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Currently using {authMode === 'nextauth' ? 'NextAuth' : 'API'} authentication
                        </p>
                      </div>
                      <Badge variant="outline">
                        {authMode === 'nextauth' ? 'NextAuth' : 'API'} Mode
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about job matches and applications
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Privacy Settings</p>
                        <p className="text-sm text-muted-foreground">
                          Control your profile visibility and data sharing
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-600">Danger Zone</p>
                          <p className="text-sm text-muted-foreground">
                            Irreversible and destructive actions
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
