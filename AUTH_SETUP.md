# Complete Authentication System Documentation

This document describes the comprehensive authentication system implementation for the disability job platform with integrated login, forgot password, and session management.

## 📋 Overview

The authentication system includes:
- **User Registration** with email/password and auto-login
- **User Login** with credentials or social OAuth
- **Forgot Password** flow with secure token generation
- **Reset Password** with validation and expiry
- **Remember Me** functionality with extended sessions
- **Session Management** with NextAuth.js
- **Role-based Access** (Job Seeker, Employer, Admin)
- **Profile Management** with extended user information
- **Database Integration** with Prisma and PostgreSQL

## 🗄️ Database Schema

### User Model
- Basic user information (id, name, email, password)
- Role management (JOB_SEEKER, EMPLOYER, ADMIN)
- Profile completion status
- Terms and privacy agreement tracking

### UserProfile Model
- Extended personal and professional information
- Accessibility needs and accommodations
- Work preferences and skills
- Social links and portfolio information

### Authentication Models
- Account (OAuth provider data)
- Session (user sessions)
- VerificationToken (email verification and password reset)

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with auto-login
- `POST /api/auth/login` - Login validation (used with NextAuth)
- `POST /api/auth/check-email` - Check email availability
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js routes

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🔧 Setup Instructions

1. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your database URLs and authentication secrets.

2. **Database Migration**
   ```bash
   npx prisma migrate dev --name complete_auth_system
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Authentication**
   ```bash
   node test-auth-complete.js
   ```

## 🧪 Testing

### Manual Testing
1. **Registration Flow**
   - Visit `http://localhost:3001/auth`
   - Click "Sign Up" tab
   - Fill registration form
   - Verify auto-login after registration

2. **Login Flow**
   - Visit `http://localhost:3001/auth`
   - Enter credentials
   - Test "Remember Me" functionality
   - Verify dashboard access

3. **Forgot Password Flow**
   - Visit `http://localhost:3001/auth/forgot-password`
   - Enter email address
   - Check console for reset link (development mode)
   - Follow reset link to change password

4. **Session Management**
   - Test session persistence
   - Verify remember me extends session
   - Test logout functionality

### API Testing
Run the comprehensive test script:
```bash
node test-auth-complete.js
```

## 🔐 Security Features

- **Password Hashing** with bcryptjs (12 rounds)
- **Email Validation** and duplicate prevention
- **Session Security** with NextAuth.js
- **CSRF Protection** built into NextAuth.js
- **Input Validation** with Zod schemas
- **Secure Password Reset** with time-limited tokens
- **Remember Me** with secure cookie management

## 📱 Frontend Integration

### Pages
- `src/app/auth/page.tsx` - Sign in/up form with forgot password link
- `src/app/auth/forgot-password/page.tsx` - Password reset request
- `src/app/auth/reset-password/page.tsx` - Password reset form
- `src/app/dashboard/page.tsx` - Protected dashboard with session info

### Components & Utilities
- `src/hooks/use-auth.tsx` - Authentication hook with protection
- `src/lib/session.ts` - Session management utilities
- `src/components/providers/auth-provider.tsx` - Session provider

### Usage Examples

#### Protect a Page
```tsx
import { useRequireAuth } from '@/hooks/use-auth'

export default function ProtectedPage() {
  const { user, isLoading } = useRequireAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>Welcome, {user.name}!</div>
}
```

#### Server-side Protection
```tsx
import { requireAuth } from '@/lib/session'

export default async function ServerProtectedPage() {
  const session = await requireAuth() // Auto-redirects if not authenticated
  
  return <div>Hello, {session.user.name}!</div>
}
```

#### Role-based Protection
```tsx
import { requireRole } from '@/lib/session'

export default async function AdminPage() {
  const session = await requireRole(['ADMIN']) // Only admins can access
  
  return <div>Admin Dashboard</div>
}
```

## 🎯 Features Implemented

✅ **Registration & Auto-Login**
- User registration with validation
- Automatic sign-in after successful registration
- Email availability checking in real-time

✅ **Login System**
- Email/password authentication
- Remember me functionality (extended session)
- Session persistence across browser sessions

✅ **Password Management**
- Forgot password with email notifications
- Secure token generation for reset links
- Password reset with validation and expiry
- Password strength indicators

✅ **Session Management**
- JWT-based sessions with NextAuth.js
- Remember me cookie handling
- Session information display
- Secure logout with cleanup

✅ **Security & Validation**
- bcryptjs password hashing
- Zod schema validation
- Input sanitization
- CSRF protection
- Time-limited reset tokens

✅ **User Experience**
- Responsive authentication UI
- Real-time validation feedback
- Password strength visualization
- Success/error messaging
- Smooth transitions and animations

## 🔄 Authentication Flow

### Registration Flow
```
1. User submits registration form
2. API validates input with Zod
3. Check for existing email
4. Hash password with bcryptjs
5. Create user and profile in database
6. Auto-login user with NextAuth
7. Redirect to profile setup
```

### Login Flow
```
1. User submits login form
2. NextAuth CredentialsProvider validates
3. Compare password with hash
4. Create JWT session
5. Set remember me cookie if requested
6. Redirect to dashboard/profile setup
```

### Forgot Password Flow
```
1. User requests password reset
2. Generate secure reset token
3. Store token with expiry in database
4. Send reset email (console log in dev)
5. User clicks reset link
6. Validate token and expiry
7. Allow password change
8. Clean up used token
```

## 🐛 Troubleshooting

### Common Issues

1. **Prisma Generation Errors**
   ```bash
   npx prisma generate --force
   npx prisma db push
   ```

2. **Database Connection Issues**
   - Check your DATABASE_URL in .env
   - Ensure database is running
   - Verify connection string format

3. **NextAuth Configuration**
   - Ensure NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Verify OAuth provider credentials

4. **Password Reset Not Working**
   - Check VerificationToken table exists
   - Verify token expiry logic
   - Check console for reset URLs in development

### Debug Mode
Set `DEBUG=1` in your environment to enable detailed logging.

## 📚 Dependencies

- **NextAuth.js** - Authentication framework
- **Prisma** - Database ORM with VerificationToken support
- **bcryptjs** - Password hashing
- **Zod** - Runtime validation
- **crypto** (Node.js) - Secure token generation
- **Framer Motion** - UI animations

## 🎯 Testing Checklist

- [ ] User can register successfully
- [ ] Auto-login works after registration
- [ ] Email validation prevents duplicates
- [ ] Login with correct credentials works
- [ ] Remember me extends session
- [ ] Forgot password generates reset token
- [ ] Reset password form validates input
- [ ] Password reset changes user password
- [ ] Used reset tokens are invalidated
- [ ] Expired tokens are rejected
- [ ] Session persists across browser restarts
- [ ] Logout clears session and cookies
- [ ] Protected pages redirect to auth
- [ ] Dashboard shows user information

---

For questions or issues, check the comprehensive test script or create an issue in the project repository.
