# AI Job Recommendation System Documentation

## Overview

This document provides a comprehensive guide to the AI-powered job recommendation system built for the disability-focused job platform. The system leverages Google Generative AI to analyze user profiles and provide personalized job recommendations with a focus on accessibility and accommodation matching.

## Architecture

### Core Components

1. **AI Prompt Configuration** (`/src/lib/ai/job-recommendation-prompt.ts`)
   - System prompt for Google Generative AI
   - Input/output interfaces
   - Prompt generation logic

2. **AI Service** (`/src/lib/ai/job-recommendation-ai.ts`)
   - Google Generative AI integration
   - Recommendation generation
   - Fallback mechanisms

3. **API Routes** (`/src/app/api/`)
   - User profile CRUD operations
   - Recommendation management
   - Analytics and insights

4. **Service Layer** (`/src/services/`)
   - Client-side API interaction
   - Data validation and formatting
   - Error handling

5. **React Hooks** (`/src/hooks/useRecommendations.ts`)
   - State management
   - Reactive data handling
   - User actions

6. **UI Components** (`/src/components/job-recommendations.tsx`)
   - Interactive recommendation display
   - Feedback collection
   - Analytics dashboard

## Database Schema

### UserProfile Model
```prisma
model UserProfile {
  id              String              @id @default(cuid())
  userId          String              @unique
  status          ProfileStatus       @default(NOT_STARTED)
  currentStep     Int                 @default(1)
  completedSteps  Int[]               @default([])
  
  // Basic Information
  fullName        String?
  preferredName   String?
  location        String?
  email           String?
  phone           String?
  
  // Disability Profile
  disabilityTypes String[]            @default([])
  supportNeeds    String?
  assistiveTech   String[]            @default([])
  accommodations  String?
  
  // Skills & Preferences
  softSkills      String[]            @default([])
  hardSkills      String[]            @default([])
  industries      String[]            @default([])
  workArrangement String?
  
  // Education & Experience
  education       Json[]              @default([])
  experience      Json[]              @default([])
  
  // Documents
  resumeUrl       String?
  certificationUrls String[]          @default([])
  certifications  Json[]              @default([])
  
  // Additional Info
  customSummary   String?
  additionalInfo  String?
  
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  completedAt     DateTime?
}
```

### JobRecommendationRating Model
```prisma
model JobRecommendationRating {
  id              String    @id @default(cuid())
  userId          String
  jobId           String
  
  // Rating data
  rating          Int       // 1-10 scale
  feedback        String?
  reason          RatingReason?
  
  // AI context
  recommendedBy   String?   // 'AI'
  matchScore      Float?    // 0-100 percentage
  
  // User feedback
  isHelpful       Boolean?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([userId, jobId])
}
```

## AI Configuration

### System Prompt Design

The AI system prompt is designed with the following principles:

1. **Disability-First Approach**: Prioritizes accessibility and accommodation matching
2. **Multi-Factor Analysis**: Evaluates skills, work arrangements, industry fit, and location
3. **Respectful Language**: Uses person-first, empowering language
4. **Actionable Insights**: Provides constructive feedback and development suggestions

### Weighting System

- **Accommodation Matching**: 30% - Highest priority for disability compatibility
- **Skills Assessment**: 25% - Technical and soft skills alignment
- **Work Arrangement**: 20% - Remote, hybrid, on-site preferences
- **Industry Alignment**: 15% - Career and interest matching
- **Location & Logistics**: 10% - Geographic and accessibility factors

### Rating Scale

- **9-10**: PERFECT_MATCH - Exceptional alignment across all factors
- **7-8**: GOOD_FIT - Strong match with minor considerations
- **5-6**: SOME_INTEREST - Moderate fit with development potential
- **3-4**: NOT_RELEVANT - Limited alignment, significant gaps
- **1-2**: POOR_MATCH - Poor fit, multiple incompatibilities

## API Endpoints

### User Profiles

#### GET `/api/profiles/[userId]`
Retrieve user profile data.

**Authentication**: Required (own profile or admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "profile_id",
    "userId": "user_id",
    "status": "COMPLETED",
    "fullName": "John Doe",
    "disabilityTypes": ["VISUAL"],
    "softSkills": ["Communication", "Problem Solving"],
    "hardSkills": ["JavaScript", "React"],
    // ... other profile fields
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "JOB_SEEKER"
    }
  }
}
```

#### PUT `/api/profiles/[userId]`
Update or create user profile.

**Authentication**: Required (own profile only)

**Request Body**:
```json
{
  "status": "COMPLETED",
  "currentStep": 6,
  "fullName": "John Doe",
  "location": "New York, NY",
  "email": "john@example.com",
  "phone": "+1234567890",
  "disabilityTypes": ["VISUAL"],
  "assistiveTech": ["Screen Reader"],
  "softSkills": ["Communication", "Teamwork"],
  "hardSkills": ["JavaScript", "React", "Node.js"],
  "industries": ["Technology"],
  "workArrangement": "Remote"
}
```

#### DELETE `/api/profiles/[userId]`
Delete user profile.

**Authentication**: Required (own profile or admin)

#### GET `/api/profiles`
List all profiles (admin only).

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by profile status
- `search`: Search term

#### POST `/api/profiles`
Create new profile.

**Request Body**:
```json
{
  "userId": "user_id"
}
```

### Job Recommendations

#### GET `/api/recommendations/[userId]`
Get job recommendations for user.

**Authentication**: Required (own recommendations or admin)

**Query Parameters**:
- `regenerate`: Force regenerate recommendations (boolean)
- `limit`: Maximum recommendations (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_id",
        "jobId": "job_id",
        "rating": 8,
        "matchScore": 85.5,
        "reason": "GOOD_FIT",
        "feedback": "This role aligns well with your technical skills...",
        "recommendedBy": "AI",
        "isHelpful": null,
        "job": {
          "id": "job_id",
          "title": "Frontend Developer",
          "company": {
            "name": "Tech Corp"
          },
          "location": "Remote",
          "workType": "REMOTE",
          "accommodations": ["VISUAL", "HEARING"]
        }
      }
    ],
    "analysis": {
      "totalJobsAnalyzed": 50,
      "topMatchingFactors": ["Remote work capability", "Technical skills"],
      "recommendedSkillImprovements": ["TypeScript", "Testing"],
      "accommodationInsights": ["Screen reader compatibility", "Flexible scheduling"]
    },
    "cached": false,
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST `/api/recommendations/[userId]`
Update recommendation rating.

**Request Body**:
```json
{
  "jobId": "job_id",
  "rating": 9,
  "feedback": "Perfect match for my skills and needs!",
  "reason": "PERFECT_MATCH",
  "isHelpful": true
}
```

#### DELETE `/api/recommendations/[userId]`
Delete recommendation(s).

**Query Parameters**:
- `jobId`: Specific job ID to delete (optional, deletes all if not provided)

### Analytics

#### GET `/api/recommendations/analytics`
Get recommendation analytics (admin only).

**Query Parameters**:
- `period`: Time period ('7d', '30d', '90d')
- `userId`: Filter by specific user

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRecommendations": 1250,
      "averageRating": 7.2,
      "conversionRate": 12.5,
      "period": "30d"
    },
    "ratingDistribution": [
      { "rating": 8, "count": 320 },
      { "rating": 7, "count": 280 }
    ],
    "reasonDistribution": [
      { "reason": "GOOD_FIT", "count": 450 },
      { "reason": "PERFECT_MATCH", "count": 200 }
    ],
    "helpfulnessStats": {
      "helpful": 800,
      "notHelpful": 150
    },
    "topRatedJobs": [
      {
        "jobId": "job_1",
        "jobTitle": "Senior Developer",
        "companyName": "Tech Corp",
        "rating": 9.2,
        "matchScore": 92.0
      }
    ]
  }
}
```

#### POST `/api/recommendations/analytics`
Execute analytics actions (admin only).

**Request Body**:
```json
{
  "action": "regenerate_all" | "cleanup_old" | "refresh_user",
  "userId": "user_id" // required for 'refresh_user' action
}
```

## Service Layer

### ProfileService

```typescript
import { profileService } from '@/services/profile.service';

// Get profile
const profile = await profileService.getProfile(userId);

// Update profile
const result = await profileService.updateProfile(userId, {
  fullName: 'John Doe',
  status: 'COMPLETED'
});

// Complete profile
const completed = await profileService.completeProfile(userId, finalData);

// Validate data
const validation = profileService.validateProfileData(data, step);
```

### RecommendationService

```typescript
import { recommendationService } from '@/services/recommendation.service';

// Get recommendations
const recommendations = await recommendationService.getRecommendations(userId);

// Update recommendation
const updated = await recommendationService.updateRecommendation(userId, {
  jobId: 'job_1',
  rating: 8,
  feedback: 'Great match!'
});

// Mark as helpful
const marked = await recommendationService.markRecommendationHelpful(
  userId, 
  jobId, 
  true
);
```

## React Hooks

### useRecommendations

```typescript
import { useRecommendations } from '@/hooks/useRecommendations';

function RecommendationPage() {
  const {
    recommendations,
    loading,
    error,
    regenerating,
    fetchRecommendations,
    updateRecommendation,
    markHelpful,
    regenerateAll,
    getStats
  } = useRecommendations(userId);

  const stats = getStats();
  
  // Auto-fetches on mount
  // Provides reactive state management
  // Handles error states
}
```

### useRecommendationAnalytics

```typescript
import { useRecommendationAnalytics } from '@/hooks/useRecommendations';

function AdminDashboard() {
  const {
    analytics,
    loading,
    error,
    fetchAnalytics,
    executeAction
  } = useRecommendationAnalytics();

  // Admin-only analytics functionality
}
```

## UI Components

### JobRecommendations Component

```typescript
import { JobRecommendations } from '@/components/job-recommendations';

function DashboardPage() {
  return (
    <JobRecommendations 
      userId={userId}
      showAnalytics={true}
      compact={false}
    />
  );
}
```

Features:
- Interactive recommendation cards
- Rating and feedback system
- Helpful/not helpful buttons
- Real-time updates
- Accommodation highlighting
- Match score visualization
- AI insights display

## Error Handling

### API Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details" // optional
}
```

### Common Error Codes

- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User lacks permission
- **404 Not Found**: Resource not found
- **400 Bad Request**: Invalid input data
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server error

### Client-Side Error Handling

Services and hooks include comprehensive error handling:

```typescript
try {
  const result = await profileService.updateProfile(userId, data);
  if (!result.success) {
    toast.error(result.error);
    return;
  }
  // Handle success
} catch (error) {
  toast.error('An unexpected error occurred');
}
```

## Security Considerations

### Authentication
- All API routes require authentication
- User can only access their own data (unless admin)
- Session-based authentication with NextAuth

### Authorization
- Role-based access control (JOB_SEEKER, EMPLOYER, ADMIN)
- Profile ownership validation
- Admin-only analytics endpoints

### Data Validation
- Input validation on both client and server
- Prisma schema enforcement
- Type safety with TypeScript

### Privacy
- Sensitive data handling for disability information
- GDPR compliance considerations
- User consent for AI processing

## Performance Optimization

### Caching Strategy
- 24-hour cache for recommendations
- Redis caching for frequent queries
- Client-side state management

### Database Optimization
- Indexed queries for common operations
- Pagination for large datasets
- Efficient joins with Prisma

### AI Rate Limiting
- Request throttling for Google AI API
- Fallback mechanisms for API failures
- Cost optimization strategies

## Testing

### Unit Tests
```bash
# Run API tests
npm run test:api

# Run service tests
npm run test:services

# Run component tests
npm run test:components
```

### Integration Tests
```bash
# Run full integration tests
npm run test:integration
```

### AI Testing
```bash
# Test AI service
npm run test:ai
```

## Deployment

### Environment Variables
```env
# Google AI
GOOGLE_AI_API_KEY=your_google_ai_key

# Database
DATABASE_URL=your_postgres_url
DIRECT_URL=your_postgres_direct_url

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_app_url
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] AI API key valid and funded
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

## Monitoring

### Metrics to Track
- Recommendation generation success rate
- User engagement with recommendations
- AI API response times
- Database query performance
- Error rates and types

### Logging
- API request/response logging
- AI interaction logging
- Error tracking with stack traces
- User action analytics

## Future Enhancements

### Planned Features
1. **Machine Learning Improvements**
   - User feedback learning
   - Collaborative filtering
   - A/B testing for prompts

2. **Advanced Analytics**
   - Predictive analytics
   - Recommendation effectiveness scoring
   - User journey analysis

3. **Integration Enhancements**
   - Third-party job board integration
   - ATS system connections
   - Accessibility tool APIs

4. **User Experience**
   - Mobile app development
   - Voice interface support
   - Advanced accessibility features

## Support

### Documentation
- API documentation with examples
- Component library documentation
- Development setup guide

### Community
- GitHub issues for bug reports
- Discussions for feature requests
- Contributing guidelines

### Contact
- Technical support: tech@example.com
- Accessibility feedback: accessibility@example.com
- General inquiries: hello@example.com

---

This comprehensive system provides a robust foundation for AI-powered job recommendations with a focus on accessibility and inclusive employment. The modular architecture ensures maintainability and scalability while the extensive documentation supports development and deployment.
