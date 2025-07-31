# Job Management API Documentation

This document provides comprehensive documentation for the Job Management API built for the disability-focused job platform.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Validation](#validation)
5. [Testing](#testing)
6. [Usage Examples](#usage-examples)

## Overview

The Job Management API provides a complete solution for managing jobs, companies, and job applications in a disability-focused job platform. It includes:

- **Job Management**: CRUD operations for job postings
- **Company Management**: CRUD operations for companies
- **Job Applications**: Apply to jobs and manage applications
- **Saved Jobs**: Save and manage favorite jobs
- **Accommodation Support**: Built-in support for disability accommodations
- **Search & Filtering**: Advanced search with accommodation filtering

## Database Schema

### Core Models

#### Company Model
```prisma
model Company {
  id              String          @id @default(cuid())
  name            String
  description     String?         @db.Text
  website         String?
  logo            String?
  size            CompanySize?
  industry        String?
  location        String?
  culture         String?         @db.Text
  values          String[]        @default([])
  
  // Contact information
  contactEmail    String?
  contactPhone    String?
  
  // Social links
  linkedinUrl     String?
  twitterUrl      String?
  
  jobs            Job[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

#### Job Model
```prisma
model Job {
  id                  String              @id @default(cuid())
  title               String
  slug                String              @unique
  description         String              @db.Text
  responsibilities    String[]            @default([])
  requirements        String[]            @default([])
  preferredSkills     String[]            @default([])
  benefits            String[]            @default([])
  
  // Company relation
  companyId           String
  company             Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Job details
  location            String
  workType            WorkType
  isRemote            Boolean             @default(false)
  isHybrid            Boolean             @default(false)
  experience          ExperienceLevel
  salaryMin           Int?
  salaryMax           Int?
  salaryCurrency      String              @default("USD")
  
  // Accommodations
  accommodations      AccommodationType[] @default([])
  accommodationDetails String?            @db.Text
  
  // Application process
  applicationProcess  String[]            @default([])
  applicationDeadline DateTime?
  
  // Status and visibility
  status              JobStatus           @default(DRAFT)
  isActive            Boolean             @default(false)
  isFeatured          Boolean             @default(false)
  
  // Relations
  applications        JobApplication[]
  savedJobs           SavedJob[]
  
  // Tracking
  viewCount           Int                 @default(0)
  applicationCount    Int                 @default(0)
  
  // Timestamps
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  publishedAt         DateTime?
  closedAt            DateTime?
}
```

#### Enums

```prisma
enum AccommodationType {
  VISUAL
  HEARING
  MOBILITY
  COGNITIVE
  MOTOR
  SOCIAL
  SENSORY
  COMMUNICATION
  LEARNING
  MENTAL_HEALTH
}

enum WorkType {
  FULL_TIME
  PART_TIME
  CONTRACT
  FREELANCE
  REMOTE
  HYBRID
  ON_SITE
}

enum ExperienceLevel {
  ENTRY_LEVEL
  JUNIOR
  MID_LEVEL
  SENIOR
  LEAD
  EXECUTIVE
}

enum JobStatus {
  DRAFT
  PUBLISHED
  PAUSED
  CLOSED
  EXPIRED
}
```

## API Endpoints

### Jobs API

#### GET /api/jobs
Get a paginated list of jobs with filtering options.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for title, description, or company name
- `workType` (array): Filter by work types
- `experience` (array): Filter by experience levels
- `accommodations` (array): Filter by accommodation types
- `location` (string): Filter by location
- `companyId` (string): Filter by company ID
- `salaryMin` (number): Minimum salary filter
- `salaryMax` (number): Maximum salary filter
- `isRemote` (boolean): Filter for remote jobs
- `sortBy` (string): Sort field (createdAt, updatedAt, title, salaryMin, salaryMax)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "clxx123456789",
        "title": "Senior Frontend Developer",
        "description": "Job description...",
        "location": "San Francisco, CA",
        "workType": "FULL_TIME",
        "experience": "SENIOR",
        "salaryMin": 120000,
        "salaryMax": 150000,
        "accommodations": ["VISUAL", "COGNITIVE"],
        "company": {
          "id": "company123",
          "name": "TechCorp Inc.",
          "logo": "https://example.com/logo.png"
        },
        "_count": {
          "applications": 25,
          "savedJobs": 12
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /api/jobs/[id]
Get detailed information about a specific job.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxx123456789",
    "title": "Senior Frontend Developer",
    "description": "Detailed job description...",
    "responsibilities": ["Develop features", "Code reviews"],
    "requirements": ["React experience", "TypeScript"],
    "benefits": ["Health insurance", "401k"],
    "company": {
      "id": "company123",
      "name": "TechCorp Inc.",
      "description": "Company description...",
      "culture": "Innovation focused culture...",
      "values": ["Innovation", "Collaboration"]
    }
  }
}
```

#### POST /api/jobs/create
Create a new job posting (requires authentication).

**Request Body:**
```json
{
  "title": "Senior Frontend Developer",
  "description": "We're looking for a senior frontend developer...",
  "companyId": "company123",
  "location": "San Francisco, CA",
  "workType": "FULL_TIME",
  "experience": "SENIOR",
  "salaryMin": 120000,
  "salaryMax": 150000,
  "accommodations": ["VISUAL", "COGNITIVE"],
  "responsibilities": ["Develop features", "Code reviews"],
  "requirements": ["React experience", "TypeScript"],
  "benefits": ["Health insurance", "401k"]
}
```

#### PUT /api/jobs/[id]
Update an existing job posting (requires authentication).

#### DELETE /api/jobs/[id]
Delete a job posting (requires authentication).

### Job Applications API

#### POST /api/jobs/applications
Apply to a job (requires authentication).

**Request Body:**
```json
{
  "jobId": "clxx123456789",
  "coverLetter": "I am very interested in this position...",
  "resumeUrl": "https://example.com/resume.pdf",
  "customAnswers": [
    {
      "question": "Why do you want this job?",
      "answer": "Great opportunity to grow..."
    }
  ]
}
```

#### GET /api/jobs/applications
Get user's job applications (requires authentication).

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by application status

### Saved Jobs API

#### POST /api/jobs/saved
Save a job to favorites (requires authentication).

**Request Body:**
```json
{
  "jobId": "clxx123456789"
}
```

#### GET /api/jobs/saved
Get user's saved jobs (requires authentication).

#### DELETE /api/jobs/saved?jobId=xxx
Remove a job from saved jobs (requires authentication).

### Companies API

#### GET /api/companies
Get a paginated list of companies.

#### POST /api/companies
Create a new company (requires authentication).

#### GET /api/companies/[id]
Get detailed company information with their jobs.

#### PUT /api/companies/[id]
Update company information (requires authentication).

#### DELETE /api/companies/[id]
Delete a company (requires authentication, only if no active jobs).

## Validation

The API uses Zod for request validation. Key validation rules:

### Job Creation Validation
- `title`: Required, 1-255 characters
- `description`: Required, minimum 1 character
- `companyId`: Required, valid CUID format
- `location`: Required, 1-255 characters
- `workType`: Required, valid enum value
- `experience`: Required, valid enum value
- `salaryMin/salaryMax`: Optional, positive integers, min ≤ max
- `accommodations`: Array of valid accommodation types

### Company Creation Validation
- `name`: Required, 1-255 characters
- `website`: Optional, valid URL or empty string
- `contactEmail`: Optional, valid email or empty string
- `size`: Optional, valid company size enum

## Testing

### Running Tests

```bash
npm test
```

### Test Coverage

The API includes comprehensive tests covering:

- **Validation Tests**: Zod schema validation for all endpoints
- **Database Logic Tests**: Query building and filtering logic
- **Response Format Tests**: API response structure validation
- **Business Logic Tests**: Application rules and constraints

### Example Test

```typescript
describe("CreateJobSchema", () => {
  it("should validate valid job creation data", () => {
    const validData = {
      title: "Senior Frontend Developer",
      description: "A great opportunity",
      companyId: "clxx123456789",
      location: "San Francisco, CA",
      workType: "FULL_TIME",
      experience: "SENIOR"
    }

    const result = CreateJobSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
```

## Usage Examples

### Frontend Integration

#### Fetching Jobs with Filters

```typescript
const fetchJobs = async (filters: JobFilters) => {
  const params = new URLSearchParams({
    page: filters.page.toString(),
    limit: filters.limit.toString(),
    ...(filters.search && { search: filters.search }),
    ...(filters.workType && { workType: filters.workType }),
    ...(filters.accommodations && { accommodations: filters.accommodations })
  })

  const response = await fetch(`/api/jobs?${params}`)
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error)
  }
  
  return data.data
}
```

#### Applying to a Job

```typescript
const applyToJob = async (jobId: string, applicationData: ApplicationData) => {
  const response = await fetch('/api/jobs/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jobId,
      ...applicationData
    })
  })

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error)
  }
  
  return data.data
}
```

### Service Layer Usage

```typescript
import { JobService } from '@/lib/services/job.service'

// Get jobs with filters
const jobs = await JobService.getJobs({
  page: 1,
  limit: 10,
  search: "developer",
  accommodations: ["VISUAL", "COGNITIVE"],
  workType: ["FULL_TIME", "REMOTE"]
})

// Create a new job
const newJob = await JobService.createJob({
  title: "Frontend Developer",
  description: "Great opportunity...",
  companyId: "company123",
  location: "Remote",
  workType: "REMOTE",
  experience: "MID_LEVEL"
})
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

Most endpoints require authentication using NextAuth.js. The API checks for valid sessions and user permissions before allowing access to protected resources.

## Accommodation Support

The API has built-in support for disability accommodations:

- **Accommodation Types**: Pre-defined accommodation categories
- **Filtering**: Search jobs by accommodation types
- **Company Profiles**: Companies can specify available accommodations
- **Application Matching**: Jobs can be matched based on user accommodation needs

This comprehensive API provides a solid foundation for building a disability-focused job platform with full CRUD operations, advanced filtering, and robust validation.
