# Job Creation API Example

## POST /api/jobs - Create Job

The API endpoint now supports creating new jobs with proper validation and authentication.

### Example Usage with Hook

```typescript
import { useJobActions } from '@/hooks/use-jobs'
import type { CreateJobRequest } from '@/lib/validations/job'

function CreateJobForm() {
  const { createJob, loading, error } = useJobActions()
  
  const handleCreateJob = async () => {
    const jobData: CreateJobRequest = {
      title: "Senior Frontend Developer",
      description: "We are looking for an experienced frontend developer...",
      companyId: "company_id_here",
      location: "Remote, US",
      workType: "REMOTE",
      experience: "SENIOR",
      responsibilities: [
        "Develop user interfaces using React",
        "Collaborate with design team",
        "Optimize application performance"
      ],
      requirements: [
        "5+ years of React experience",
        "Strong TypeScript skills",
        "Experience with accessibility standards"
      ],
      benefits: [
        "Health insurance",
        "Flexible working hours",
        "Professional development budget"
      ],
      accommodations: ["VISUAL", "HEARING"],
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: "USD",
      isRemote: true,
      status: "PUBLISHED"
    }
    
    try {
      const result = await createJob(jobData)
      console.log('Job created:', result.data)
    } catch (err) {
      console.error('Failed to create job:', err)
    }
  }
  
  return (
    <button onClick={handleCreateJob} disabled={loading}>
      {loading ? 'Creating...' : 'Create Job'}
    </button>
  )
}
```

### Direct API Usage

```typescript
const response = await fetch('/api/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: "Software Engineer",
    description: "Join our team...",
    companyId: "cuid_company_id",
    location: "New York, NY",
    workType: "FULL_TIME",
    experience: "MID_LEVEL",
    // ... other required fields
  })
})

const result = await response.json()
```

### Required Fields

According to the Zod schema, these fields are required:

- `title` (string, 1-255 chars)
- `description` (string, min 1 char)
- `companyId` (valid CUID)
- `location` (string, 1-255 chars)
- `workType` (enum: FULL_TIME, PART_TIME, CONTRACT, etc.)
- `experience` (enum: ENTRY_LEVEL, JUNIOR, MID_LEVEL, etc.)

### Optional Fields

- `responsibilities` (array of strings)
- `requirements` (array of strings)
- `preferredSkills` (array of strings)
- `benefits` (array of strings)
- `salaryMin/salaryMax` (positive integers)
- `accommodations` (array of accommodation types)
- `isRemote` (boolean, default: false)
- `status` (enum, default: "DRAFT")
- And many more...

### Authentication & Authorization

- User must be authenticated (valid session)
- User must have role "ADMIN" or "EMPLOYER"
- Employers can only create jobs for their own company
- Admins can create jobs for any company

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "job_id",
    "title": "Job Title",
    "slug": "job-title",
    "company": {
      "id": "company_id",
      "name": "Company Name",
      "logo": "logo_url"
    },
    // ... full job data
  },
  "message": "Job created successfully"
}
```

### Error Handling

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed validation errors (if applicable)"
}
```
