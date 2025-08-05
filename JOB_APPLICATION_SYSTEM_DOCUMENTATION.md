# Job Application System Documentation

## Overview

This comprehensive job application system provides users with the ability to easily apply for jobs using their profile or by uploading a CV, view the status of their applications, share application links, and report issues or concerns.

## Features Implemented

### 1. Job Application API Routes

#### `/api/jobs/applications` - Main Applications Endpoint
- **POST**: Submit a new job application
- **GET**: Retrieve user's job applications with filtering and pagination

#### `/api/jobs/applications/[id]` - Individual Application Management
- **GET**: Retrieve specific application details
- **PUT**: Update application (for employers)
- **DELETE**: Withdraw application (for applicants)

#### `/api/jobs/applications/status` - Application Status Overview
- **GET**: Get application statistics and recent applications summary

#### `/api/jobs/applications/share` - Application Sharing
- **POST**: Create shareable links for applications

### 2. Reporting System

#### `/api/reports` - Issue Reporting
- **POST**: Submit reports about jobs, applications, or companies
- **GET**: Retrieve user's submitted reports

### 3. Frontend Components

#### ApplicationModal Component (`/src/components/application-modal.tsx`)
- **ADA Profile Tab**: Quick application using pre-filled accessibility profile
- **Custom Application Tab**: Full form with resume upload and cover letter
- **Real-time API integration** for submitting applications
- **Error handling** and success feedback

#### ApplicationDashboard Component (`/src/components/application-dashboard.tsx`)
- **Status Overview Cards**: Total applications, under review, interviews, success rate
- **Application List**: Filterable list of all user applications
- **Action Buttons**: Share, withdraw, and view applications
- **Timeline View**: Application progress tracking

#### ApplicationDetailView Component (`/src/components/application-detail-view.tsx`)
- **Detailed Status Information**: Current status with descriptions
- **Application Timeline**: Visual progress tracking
- **Application Details**: Cover letter, resume, and custom answers
- **Company Information**: Job and company details
- **Action Panel**: Share and withdraw options

### 4. Custom Hooks

#### useJobApplications Hook (`/src/hooks/use-job-applications.ts`)
- **Application Management**: Submit, withdraw, and fetch applications
- **Status Tracking**: Get application status and statistics
- **Sharing Functionality**: Share applications via multiple channels
- **Issue Reporting**: Report problems with jobs or applications

### 5. Pages and Routes

#### `/applications` - Application Dashboard Page
- Main dashboard showing all user applications
- Status overview and filtering capabilities
- Protected route requiring authentication

#### `/applications/[id]` - Individual Application Page
- Detailed view of specific application
- Timeline and status information
- Action buttons for management

## API Schemas and Validation

### Job Application Schema
```typescript
{
  jobId: string (CUID)
  coverLetter?: string
  resumeUrl?: string (URL)
  customAnswers?: Array<{
    question: string
    answer: string
  }>
}
```

### Application Status Types
- `PENDING`: Initial submission
- `REVIEWING`: Under employer review
- `INTERVIEW_SCHEDULED`: Interview arranged
- `INTERVIEW_COMPLETED`: Interview finished
- `OFFER_EXTENDED`: Job offer received
- `ACCEPTED`: Offer accepted
- `REJECTED`: Application declined
- `WITHDRAWN`: Application withdrawn

### Report Schema
```typescript
{
  type: "job" | "application" | "company"
  targetId: string (CUID)
  reportType: "accessibility" | "inaccurate" | "inappropriate" | "spam" | "discrimination" | "technical_issue" | "other"
  description: string (10-1000 chars)
  evidence?: string[] (URLs)
}
```

## Database Integration

### JobApplication Model (Prisma)
```prisma
model JobApplication {
  id              String                    @id @default(cuid())
  jobId           String
  userId          String
  
  job             Job                       @relation(fields: [jobId], references: [id], onDelete: Cascade)
  user            User                      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Application data
  coverLetter     String?                   @db.Text
  resumeUrl       String?
  customAnswers   Json[]                    @default([])
  
  // Status tracking
  status          ApplicationStatus         @default(PENDING)
  
  // Timeline
  appliedAt       DateTime                  @default(now())
  reviewedAt      DateTime?
  interviewAt     DateTime?
  rejectedAt      DateTime?
  acceptedAt      DateTime?
  
  // Notes from employer
  employerNotes   String?                   @db.Text
  
  createdAt       DateTime                  @default(now())
  updatedAt       DateTime                  @updatedAt
  
  @@unique([jobId, userId])
  @@index([userId])
  @@index([jobId])
  @@index([status])
}
```

## Usage Examples

### 1. Submitting an Application
```typescript
import { useApplicationActions } from '@/hooks/use-job-applications'

const { submitApplication } = useApplicationActions()

const handleApply = async () => {
  try {
    await submitApplication({
      jobId: "job_123",
      coverLetter: "I am interested in this position...",
      resumeUrl: "https://example.com/resume.pdf",
      customAnswers: [
        {
          question: "Why do you want this job?",
          answer: "Great opportunity to grow..."
        }
      ]
    })
  } catch (error) {
    console.error("Application failed:", error)
  }
}
```

### 2. Viewing Applications Dashboard
```typescript
import { useJobApplications, useApplicationStatus } from '@/hooks/use-job-applications'

const { applications, loading } = useJobApplications({ status: "PENDING" })
const { status } = useApplicationStatus()
```

### 3. Sharing an Application
```typescript
const { shareApplication } = useApplicationActions()

const handleShare = async () => {
  await shareApplication({
    applicationId: "app_123",
    shareType: "linkedin",
    message: "Excited about this opportunity!"
  })
}
```

### 4. Reporting an Issue
```typescript
const { reportIssue } = useApplicationActions()

const handleReport = async () => {
  await reportIssue({
    type: "job",
    targetId: "job_123",
    reportType: "accessibility",
    description: "Job posting lacks accessibility information"
  })
}
```

## Authentication & Security

- **Protected Routes**: All application routes require authentication
- **User Ownership**: Users can only access their own applications
- **Data Validation**: Comprehensive validation using Zod schemas
- **Error Handling**: Graceful error handling with user feedback
- **Privacy**: Sensitive data protection and GDPR considerations

## Accessibility Features

- **ADA Profile Integration**: Quick application using accessibility profile
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Accommodation Tracking**: Built-in accommodation needs management
- **Status Indicators**: Clear visual and textual status information

## Error Handling

### API Error Responses
```typescript
{
  success: false,
  error: "Error message",
  details?: "Additional error details"
}
```

### Common Error Scenarios
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **400 Bad Request**: Invalid input data
- **409 Conflict**: Duplicate application

## Performance Optimizations

- **Pagination**: Large datasets are paginated
- **Caching**: Application status cached for performance
- **Debounced Filters**: Efficient filtering with debouncing
- **Optimistic Updates**: UI updates before API confirmation
- **Error Boundaries**: Graceful error handling

## Future Enhancements

1. **Email Notifications**: Automated email updates for status changes
2. **File Upload**: Direct resume upload with cloud storage
3. **Interview Scheduling**: Integrated calendar booking
4. **Analytics Dashboard**: Application success metrics
5. **Bulk Actions**: Manage multiple applications at once
6. **Export Features**: Download application history
7. **Mobile App**: React Native mobile application
8. **Real-time Updates**: WebSocket notifications for status changes

## Testing

### Unit Tests
- API route validation
- Hook functionality
- Component rendering
- Error scenarios

### Integration Tests
- End-to-end application flow
- Database operations
- Authentication flows
- File upload processes

## Deployment Considerations

1. **Environment Variables**: Configure API keys and database URLs
2. **Database Migrations**: Run Prisma migrations for schema updates
3. **File Storage**: Configure cloud storage for resume uploads
4. **Email Service**: Set up email service for notifications
5. **Monitoring**: Implement logging and error tracking
6. **Backup Strategy**: Regular database backups
7. **Rate Limiting**: Implement API rate limiting
8. **CDN**: Use CDN for static assets

This job application system provides a comprehensive solution for managing job applications with accessibility-first design, robust error handling, and excellent user experience.
