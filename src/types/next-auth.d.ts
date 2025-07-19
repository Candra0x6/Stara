import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      profileSetup: boolean
      disabilities: string[]
      accommodations: string[]
      location: string | null
      jobPreferences: any
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    profileSetup: boolean
    disabilities: string[]
    accommodations: string[]
    location: string | null
    jobPreferences: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    profileSetup: boolean
    disabilities: string[]
    accommodations: string[]
    location: string | null
    jobPreferences: any
  }
}
