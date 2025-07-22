# Profile Setup System Documentation

## Overview

The Profile Setup System is a comprehensive solution for managing user profile creation through a multi-step wizard interface. It includes Prisma schema models, REST API endpoints, Zod validation, and complete unit test coverage.

## Features

- **Multi-step Profile Wizard** (6 steps)
- **Complete REST API** (GET, POST, PUT, DELETE)
- **Step-specific endpoints** for granular updates
- **Admin management endpoints**
- **Comprehensive validation** with Zod
- **Full unit test coverage**
- **Type safety** throughout the system

## Architecture

```
src/
├── app/api/
│   ├── user/profile-setup/          # User profile setup endpoints
│   │   ├── route.ts                 # Main CRUD operations
│   │   └── step/[step]/route.ts     # Step-specific operations
│   └── admin/profile-setups/        # Admin endpoints
│       ├── route.ts                 # List all profile setups
│       └── stats/route.ts           # Statistics endpoint
├── lib/
│   ├── services/
│   │   └── profile.service.ts       # Business logic layer
│   └── validations/
│       └── profile.ts               # Zod validation schemas
└── prisma/
    └── schema.prisma                # Database schema
```

## Database Schema

### ProfileSetup Model

```prisma
model ProfileSetup {
  id              String              @id @default(cuid())
  userId          String              @unique
  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Progress tracking
  status          ProfileSetupStatus  @default(NOT_STARTED)
  currentStep     Int                 @default(1)
  completedSteps  Int[]               @default([])
  
  // Step 1: Basic Information
  fullName        String?
  preferredName   String?
  location        String?
  email           String?
  phone           String?
  
  // Step 2: Disability Profile
  disabilityTypes String[]            @default([])
  supportNeeds    String?             @db.Text
  assistiveTech   String[]            @default([])
  accommodations  String?             @db.Text
  
  // Step 3: Skills & Work Preferences
  softSkills      String[]            @default([])
  hardSkills      String[]            @default([])
  industries      String[]            @default([])
  workArrangement String?
  
  // Step 4: Education & Experience
  education       Json[]              @default([])
  experience      Json[]              @default([])
  
  // Step 5: Documents
  resumeUrl       String?
  certifications  Json[]              @default([])
  
  // Step 6: Preview & Additional Info
  customSummary   String?             @db.Text
  additionalInfo  String?             @db.Text
  
  // Timestamps
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  completedAt     DateTime?
  
  @@index([userId])
  @@index([status])
}

enum ProfileSetupStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}
```

## API Endpoints

### User Endpoints

#### Profile Setup CRUD

```typescript
// Get user's profile setup
GET /api/user/profile-setup
Response: { profileSetup: ProfileSetup, message: string }

// Create new profile setup
POST /api/user/profile-setup
Body: CreateProfileSetup
Response: { profileSetup: ProfileSetup, message: string }

// Update profile setup
PUT /api/user/profile-setup
Body: UpdateProfileSetup
Response: { profileSetup: ProfileSetup, message: string }

// Delete profile setup
DELETE /api/user/profile-setup
Response: { message: string }
```

#### Step-Specific Operations

```typescript
// Get specific step data
GET /api/user/profile-setup/step/[step]
Response: { 
  step: number, 
  stepData: object, 
  isCompleted: boolean,
  currentStep: number,
  status: string,
  message: string 
}

// Update specific step
PUT /api/user/profile-setup/step/[step]
Body: StepData (validated per step)
Response: { 
  profileSetup: ProfileSetup, 
  step: number, 
  message: string 
}
```

### Admin Endpoints

```typescript
// Get all profile setups (admin only)
GET /api/admin/profile-setups?page=1&limit=10&status=COMPLETED
Response: { 
  profiles: ProfileSetup[], 
  total: number, 
  page: number, 
  limit: number,
  message: string 
}

// Get profile setup statistics (admin only)
GET /api/admin/profile-setups/stats
Response: { 
  stats: { 
    total: number, 
    byStatus: Record<string, number> 
  }, 
  message: string 
}
```

## Validation Schemas

### Step-by-Step Validation

#### Step 1: Basic Information
```typescript
{
  fullName: string (min 2 chars, required)
  preferredName?: string
  location: string (min 2 chars, required)
  email: string (email format, required)
  phone: string (min 10 chars, required)
}
```

#### Step 2: Disability Profile
```typescript
{
  disabilityTypes: string[] (min 1 item, required)
  supportNeeds?: string
  assistiveTech?: string[]
  accommodations?: string
}
```

#### Step 3: Skills & Work Preferences
```typescript
{
  softSkills: string[] (min 1 item, required)
  hardSkills: string[] (min 1 item, required)
  industries: string[] (min 1 item, required)
  workArrangement: string (required)
}
```

#### Step 4: Education & Experience
```typescript
{
  education?: EducationEntry[]
  experience?: ExperienceEntry[]
}

// EducationEntry
{
  degree?: string
  institution?: string
  year?: string
  description?: string
}

// ExperienceEntry
{
  title?: string
  company?: string
  duration?: string
  description?: string
}
```

#### Step 5: Documents
```typescript
{
  resumeUrl?: string (URL format)
  certifications?: CertificationEntry[]
}

// CertificationEntry
{
  name: string (required)
  issuer?: string
  date?: string
  url?: string (URL format)
}
```

#### Step 6: Preview & Additional Info
```typescript
{
  customSummary?: string
  additionalInfo?: string
}
```

## Service Layer

### ProfileSetupService Methods

```typescript
class ProfileSetupService {
  // CRUD Operations
  static async getByUserId(userId: string): Promise<ProfileSetupResponse | null>
  static async getById(id: string): Promise<ProfileSetupResponse | null>
  static async create(data: CreateProfileSetup): Promise<ProfileSetupResponse>
  static async update(id: string, data: UpdateProfileSetup): Promise<ProfileSetupResponse>
  static async delete(id: string): Promise<boolean>
  
  // Step Management
  static async updateStep(userId: string, step: number, stepData: any): Promise<ProfileSetupResponse>
  
  // Admin Functions
  static async getAll(query?: ProfileSetupQuery, page?: number, limit?: number)
  static async getStats()
}
```

## Usage Examples

### Frontend Integration

```typescript
// Create new profile setup
const createProfileSetup = async (data: CreateProfileSetup) => {
  const response = await fetch('/api/user/profile-setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}

// Update specific step
const updateStep = async (step: number, stepData: any) => {
  const response = await fetch(`/api/user/profile-setup/step/${step}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stepData)
  })
  return response.json()
}

// Get current step data
const getStepData = async (step: number) => {
  const response = await fetch(`/api/user/profile-setup/step/${step}`)
  return response.json()
}
```

### Wizard Component Integration

```typescript
// In your profile setup wizard component
const ProfileSetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [profileSetup, setProfileSetup] = useState(null)

  const handleStepSubmit = async (stepData: any) => {
    try {
      const result = await updateStep(currentStep, stepData)
      setProfileSetup(result.profileSetup)
      
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      console.error('Failed to update step:', error)
    }
  }

  // Component render logic...
}
```

## Testing

### Running Tests

```bash
# Install test dependencies (add to package.json)
npm install --save-dev jest @jest/globals @testing-library/jest-dom @testing-library/react @types/jest ts-jest

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

The system includes comprehensive test coverage for:

- **Service Layer Tests** (`profile.service.test.ts`)
  - CRUD operations
  - Step management
  - Error handling
  - Edge cases

- **API Route Tests** (`route.test.ts`)
  - All HTTP methods (GET, POST, PUT, DELETE)
  - Authentication/authorization
  - Request validation
  - Response format verification

- **Step-Specific API Tests** (`step/[step]/route.test.ts`)
  - Step data retrieval
  - Step data updates
  - Step validation
  - Progress tracking

- **Validation Tests** (`profile.test.ts`)
  - Schema validation
  - Step-specific validation
  - Error message verification
  - Type checking

## Error Handling

### HTTP Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

### Error Response Format

```typescript
{
  error: string           // Human-readable error message
  details?: any[]         // Validation error details (for 400 responses)
}
```

## Security Considerations

1. **Authentication Required** - All endpoints require valid user session
2. **Authorization Checks** - Users can only access their own data (except admins)
3. **Input Validation** - All inputs validated with Zod schemas
4. **SQL Injection Prevention** - Using Prisma ORM with parameterized queries
5. **Data Sanitization** - Automatic data sanitization through Zod validation

## Performance Optimizations

1. **Database Indexes** - Indexed on `userId` and `status` fields
2. **Efficient Queries** - Using Prisma with optimized includes
3. **Pagination** - Built-in pagination for list endpoints
4. **Caching Ready** - Service layer designed for easy caching integration

## Migration Guide

To integrate this system into your existing project:

1. **Update Prisma Schema**
   ```bash
   # Add the ProfileSetup model and enum to your schema.prisma
   # Run migration
   npx prisma migrate dev --name add-profile-setup
   ```

2. **Install Dependencies**
   ```bash
   npm install zod
   npm install --save-dev jest @jest/globals @testing-library/jest-dom @types/jest ts-jest
   ```

3. **Copy Files**
   - Copy all files from this implementation
   - Update import paths to match your project structure

4. **Update User Model**
   - Add `profileSetup ProfileSetup?` relation to your User model

5. **Environment Setup**
   - Ensure your `DATABASE_URL` is configured
   - Add test database URL if needed

## Future Enhancements

Potential improvements for the system:

1. **File Upload Integration** - Direct file upload for resumes and certificates
2. **Email Notifications** - Progress reminders and completion notifications
3. **Data Export** - Export profile data in various formats
4. **Analytics Dashboard** - Detailed completion analytics for admins
5. **Multi-language Support** - Internationalization for global accessibility
6. **Real-time Updates** - WebSocket integration for live progress updates
7. **Audit Trail** - Track all changes for compliance and debugging
