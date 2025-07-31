import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      firstName?: string | null;
      lastName?: string | null;
      isProfileComplete?: boolean;
    };
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    firstName?: string | null;
    lastName?: string | null;
    isProfileComplete?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    firstName?: string | null;
    lastName?: string | null;
    isProfileComplete?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            profile: true
          }
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: (user as any).role,
          firstName: (user as any).firstName,
          lastName: (user as any).lastName,
          isProfileComplete: (user as any).isProfileComplete,
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/auth",
    signOut: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.isProfileComplete = (user as any).isProfileComplete;

        // Create database session for credentials login
        if (account?.provider === "credentials") {
          try {
            const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            const sessionToken = crypto.randomUUID();
            
            await prisma.session.create({
              data: {
                sessionToken,
                userId: user.id,
                expires: sessionExpires,
              },
            });
            
            // Store session token in JWT for reference
            token.sessionToken = sessionToken;
          } catch (error) {
            console.error("Failed to create database session:", error);
          }
        }
      }
      return token;
    },
    async session({ token, session }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.isProfileComplete = token.isProfileComplete;
      }
      return session;
    },
    async signOut({ token }) {
      // Clean up database session on sign out
      if (token.sessionToken) {
        try {
          await prisma.session.delete({
            where: {
              sessionToken: token.sessionToken as string,
            },
          });
        } catch (error) {
          console.error("Failed to delete database session:", error);
        }
      }
    },
    async redirect({ url, baseUrl }) {
      const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      if (url.startsWith('/')) {
        url = base + url;
      }
      
      if (url.includes('/setting') || url.includes('signout')) {
        return `${base}/auth`;
      }

      if (url.includes('/auth') && !url.includes('error')) {
        return `${base}/profile-setup`;
      }
      
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(base);
        
        if (urlObj.origin === baseObj.origin) {
          return url;
        }
      } catch (error) {
        console.error('Invalid URL in redirect callback:', error);
      }
      
      return `${base}/profile-setup`;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);