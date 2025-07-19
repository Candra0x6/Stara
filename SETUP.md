# Disability Job Platform - Supabase & NextAuth Setup

This project has been configured with Supabase, Prisma, and NextAuth for Google authentication.

## Environment Variables Setup

Create a `.env.local` file in your project root and add the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Setup Steps

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Copy your service role key (keep this secret!)
4. Copy your database URL from Settings > Database

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy Client ID and Client Secret

### 3. NextAuth Secret

Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```

### 4. Database Migration

Run the Prisma migration to create the necessary tables:

```bash
npx prisma migrate dev --name init
```

### 5. Run the Development Server

```bash
npm run dev
```

## Authentication Flow

1. User visits `/auth` page
2. Clicks "Continue with Google"
3. Redirected to Google OAuth
4. After successful authentication, redirected to `/profile-setup`
5. After profile setup, user can access protected routes like `/jobs`

## File Structure

```
src/
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client instance
│   └── supabase.ts      # Supabase client configuration
├── components/
│   ├── protected-route.tsx    # HOC for protecting routes
│   └── providers/
│       └── auth-provider.tsx  # Session provider wrapper
├── hooks/
│   └── use-auth.tsx     # Custom authentication hook
├── types/
│   └── next-auth.d.ts   # TypeScript declarations for NextAuth
└── app/
    ├── api/auth/[...nextauth]/
    │   └── route.ts     # NextAuth API route
    ├── auth/
    │   └── page.tsx     # Authentication page
    └── layout.tsx       # Root layout with providers
```

## Database Schema

The Prisma schema includes:

- **User**: Stores user information including disability-specific fields
- **Account**: OAuth account information
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

## Protected Routes

Use the `ProtectedRoute` component to protect pages:

```tsx
import ProtectedRoute from '@/components/protected-route'

export default function JobsPage() {
  return (
    <ProtectedRoute requireProfileSetup={true}>
      {/* Your page content */}
    </ProtectedRoute>
  )
}
```

## Useful Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Run database migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```
