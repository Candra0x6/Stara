# Job Recommendation Rating API Documentation

This API provides endpoints for managing job recommendation ratings, allowing users to rate and provide feedback on job recommendations they receive.

## Overview

The Job Recommendation Rating system allows users to:
- Rate job recommendations (1-10 scale)
- Provide feedback and reasons for their ratings
- Track recommendation quality and helpfulness
- Analyze rating patterns for improving recommendation algorithms

## Base URL
```
/api/recommendation-ratings
```

## Authentication
All endpoints require authentication via NextAuth.js session.

## Data Models

### JobRecommendationRating
```typescript
{
  id: string;              // Unique identifier
  userId: string;          // User who provided the rating
  jobId: string;           // Job that was rated
  rating: number;          // Rating 1-10
  feedback?: string;       // Optional text feedback
  reason?: RatingReason;   // Categorized reason for rating
  recommendedBy?: string;  // Source of recommendation (AI, algorithm, manual)
  matchScore?: number;     // Algorithm match percentage (0-100)
  isHelpful?: boolean;     // Whether user found recommendation helpful
  createdAt: Date;
  updatedAt: Date;
  user: UserInfo;          // User details
  job: JobInfo;            // Job details
}
```

### RatingReason Enum
- `PERFECT_MATCH` - Job perfectly matches user's preferences
- `GOOD_FIT` - Job is a good fit but not perfect
- `SOME_INTEREST` - Job has some interesting aspects
- `NOT_RELEVANT` - Job is not relevant to user
- `POOR_MATCH` - Job is a poor match
- `ALREADY_APPLIED` - User already applied to this job
- `LOCATION_ISSUE` - Job location doesn't work for user
- `SALARY_MISMATCH` - Salary doesn't meet expectations
- `SKILL_MISMATCH` - Required skills don't match user's skills
- `ACCOMMODATION_CONCERN` - Job lacks necessary accommodations

## API Endpoints

### 1. Get All Recommendation Ratings

**GET** `/api/recommendation-ratings`

Retrieve recommendation ratings with filtering and pagination.

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `userId` | string | Filter by user ID | - |
| `jobId` | string | Filter by job ID | - |
| `rating` | number | Filter by rating (1-10) | - |
| `reason` | RatingReason | Filter by rating reason | - |
| `recommendedBy` | string | Filter by recommendation source | - |
| `isHelpful` | boolean | Filter by helpfulness | - |
| `page` | number | Page number | 1 |
| `limit` | number | Items per page (1-100) | 10 |
| `sortBy` | string | Sort field (createdAt, rating, matchScore) | createdAt |
| `sortOrder` | string | Sort order (asc, desc) | desc |

#### Response
```json
{
  "data": [
    {
      "id": "rating-123",
      "userId": "user-123",
      "jobId": "job-123",
      "rating": 8,
      "feedback": "Great job recommendation!",
      "reason": "GOOD_FIT",
      "recommendedBy": "AI",
      "matchScore": 85.5,
      "isHelpful": true,
      "createdAt": "2023-07-29T10:00:00Z",
      "updatedAt": "2023-07-29T10:00:00Z",
      "user": {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "job": {
        "id": "job-123",
        "title": "Software Developer",
        "location": "Remote",
        "company": {
          "name": "Tech Corp"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 2. Create Recommendation Rating

**POST** `/api/recommendation-ratings`

Create a new recommendation rating.

#### Request Body
```json
{
  "jobId": "job-123",
  "rating": 8,
  "feedback": "Great job recommendation!",
  "reason": "GOOD_FIT",
  "recommendedBy": "AI",
  "matchScore": 85.5,
  "isHelpful": true
}
```

#### Required Fields
- `jobId`: Valid job ID
- `rating`: Number between 1-10

#### Response
```json
{
  "id": "rating-123",
  "userId": "user-123",
  "jobId": "job-123",
  "rating": 8,
  "feedback": "Great job recommendation!",
  "reason": "GOOD_FIT",
  "recommendedBy": "AI",
  "matchScore": 85.5,
  "isHelpful": true,
  "createdAt": "2023-07-29T10:00:00Z",
  "updatedAt": "2023-07-29T10:00:00Z",
  "user": { /* user details */ },
  "job": { /* job details */ }
}
```

### 3. Get Specific Recommendation Rating

**GET** `/api/recommendation-ratings/{id}`

Retrieve a specific recommendation rating by ID.

#### Parameters
- `id`: Rating ID

#### Response
```json
{
  "id": "rating-123",
  "userId": "user-123",
  "jobId": "job-123",
  "rating": 8,
  "feedback": "Great job recommendation!",
  // ... other fields
}
```

### 4. Update Recommendation Rating

**PUT** `/api/recommendation-ratings/{id}`

Update an existing recommendation rating. Users can only update their own ratings.

#### Parameters
- `id`: Rating ID

#### Request Body
```json
{
  "rating": 9,
  "feedback": "Updated feedback",
  "isHelpful": false
}
```

#### Response
```json
{
  "id": "rating-123",
  "rating": 9,
  "feedback": "Updated feedback",
  "isHelpful": false,
  // ... other fields
}
```

### 5. Delete Recommendation Rating

**DELETE** `/api/recommendation-ratings/{id}`

Delete a recommendation rating. Users can only delete their own ratings.

#### Parameters
- `id`: Rating ID

#### Response
```json
{
  "message": "Recommendation rating deleted successfully"
}
```

### 6. Get Rating by User and Job

**GET** `/api/recommendation-ratings/user/{userId}/job/{jobId}`

Get a specific rating for a user-job combination.

#### Parameters
- `userId`: User ID
- `jobId`: Job ID

#### Access Control
- Users can only access their own ratings
- Admins can access any rating

#### Response
```json
{
  "id": "rating-123",
  "userId": "user-123",
  "jobId": "job-123",
  // ... other fields
}
```

### 7. Get User Rating Statistics

**GET** `/api/recommendation-ratings/user/{userId}/stats`

Get aggregated statistics for a user's ratings.

#### Parameters
- `userId`: User ID

#### Access Control
- Users can only access their own statistics
- Admins can access any user's statistics

#### Response
```json
{
  "totalRatings": 25,
  "averageRating": 7.5,
  "averageMatchScore": 82.3,
  "helpfulRatings": 20,
  "ratingDistribution": [
    { "rating": 5, "_count": { "rating": 2 } },
    { "rating": 8, "_count": { "rating": 15 } },
    { "rating": 10, "_count": { "rating": 8 } }
  ],
  "reasonDistribution": [
    { "reason": "GOOD_FIT", "_count": { "reason": 15 } },
    { "reason": "PERFECT_MATCH", "_count": { "reason": 10 } }
  ]
}
```

### 8. Get Job Rating Statistics

**GET** `/api/recommendation-ratings/job/{jobId}/stats`

Get aggregated statistics for a job's ratings.

#### Parameters
- `jobId`: Job ID

#### Response
```json
{
  "totalRatings": 50,
  "averageRating": 8.2,
  "averageMatchScore": 75.6,
  "helpfulRatings": 42,
  "ratingDistribution": [
    { "rating": 7, "_count": { "rating": 10 } },
    { "rating": 8, "_count": { "rating": 25 } },
    { "rating": 9, "_count": { "rating": 15 } }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: You can only access your own ratings"
}
```

### 404 Not Found
```json
{
  "error": "Recommendation rating not found"
}
```

### 409 Conflict
```json
{
  "error": "Rating already exists for this user and job"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Usage Examples

### Create a Rating
```javascript
const response = await fetch('/api/recommendation-ratings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    jobId: 'job-123',
    rating: 8,
    feedback: 'Great match for my skills!',
    reason: 'GOOD_FIT',
    isHelpful: true
  })
});

const rating = await response.json();
```

### Get User's Ratings
```javascript
const response = await fetch('/api/recommendation-ratings?userId=user-123&page=1&limit=20');
const { data, pagination } = await response.json();
```

### Update a Rating
```javascript
const response = await fetch('/api/recommendation-ratings/rating-123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    rating: 9,
    feedback: 'Even better than I initially thought!'
  })
});

const updatedRating = await response.json();
```

### Get Rating Statistics
```javascript
const response = await fetch('/api/recommendation-ratings/user/user-123/stats');
const stats = await response.json();

console.log(`Average rating: ${stats.averageRating}`);
console.log(`Total ratings: ${stats.totalRatings}`);
```

## Data Validation

All request bodies are validated using Zod schemas:

- **Rating**: Must be integer between 1-10
- **Job ID**: Must be valid CUID format
- **Match Score**: Must be number between 0-100
- **Reason**: Must be one of the predefined RatingReason enum values
- **Feedback**: Optional string, max length enforced by database
- **Is Helpful**: Boolean value

## Rate Limiting

Consider implementing rate limiting for the POST endpoint to prevent spam ratings.

## Analytics Use Cases

This API enables various analytics:

1. **Recommendation Quality**: Track average ratings by recommendation source
2. **User Satisfaction**: Monitor helpful vs non-helpful ratings
3. **Job Popularity**: Identify highly-rated jobs
4. **Algorithm Improvement**: Use feedback to refine matching algorithms
5. **Trend Analysis**: Track rating patterns over time
