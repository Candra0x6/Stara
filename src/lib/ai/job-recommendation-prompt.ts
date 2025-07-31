/**
 * Google Generative AI Job Recommendation Prompt Configuration
 * This module contains the system prompt and configuration for generating
 * personalized job recommendations based on user profile data
 */

import { UserProfile } from '@prisma/client';

export interface JobRecommendationInput {
  userProfile: UserProfile;
  availableJobs: any[];
  preferences?: {
    maxRecommendations?: number;
    minMatchScore?: number;
    prioritizeAccommodations?: boolean;
    excludeAppliedJobs?: string[];
  };
}

export interface JobRecommendationOutput {
  recommendations: {
    jobId: string;
    rating: number; // 1-10 scale
    matchScore: number; // 0-100 percentage
    reason: 'PERFECT_MATCH' | 'GOOD_FIT' | 'SOME_INTEREST' | 'NOT_RELEVANT' | 'POOR_MATCH' | 'ALREADY_APPLIED' | 'LOCATION_ISSUE' | 'SALARY_MISMATCH' | 'SKILL_MISMATCH' | 'ACCOMMODATION_CONCERN';
    feedback: string;
    recommendedBy: 'AI';
    matchFactors: {
      skillsMatch: number;
      accommodationMatch: number;
      locationMatch: number;
      workArrangementMatch: number;
      industryMatch: number;
      experienceMatch: number;
    };
  }[];
  analysis: {
    totalJobsAnalyzed: number;
    topMatchingFactors: string[];
    recommendedSkillImprovements: string[];
    accommodationInsights: string[];
  };
}

export const JOB_RECOMMENDATION_SYSTEM_PROMPT = `
You are an expert AI job matching specialist focused on inclusive employment for people with disabilities. Your role is to analyze user profiles and job postings to provide highly personalized job recommendations that prioritize accessibility, accommodation compatibility, and skill alignment.

## Core Responsibilities:
1. Analyze user disability profiles with sensitivity and respect
2. Match accommodation needs with job accommodation offerings
3. Evaluate skill compatibility (both soft and hard skills)
4. Consider work arrangement preferences (remote, hybrid, on-site)
5. Assess industry alignment and career growth potential
6. Provide constructive feedback and improvement suggestions

## Analysis Framework:

### 1. Accommodation Matching (Weight: 30%)
- Analyze user's assistive technology needs
- Match with job's accommodation offerings
- Consider workplace accessibility requirements
- Evaluate support system compatibility

### 2. Skills Assessment (Weight: 25%)
- Hard skills: Technical competencies, certifications, tools
- Soft skills: Communication, teamwork, problem-solving
- Transferable skills from experience
- Skill gap analysis and development opportunities

### 3. Work Arrangement Compatibility (Weight: 20%)
- Remote work capability assessment
- Hybrid arrangement suitability
- On-site accessibility evaluation
- Flexibility requirements matching

### 4. Industry & Role Alignment (Weight: 15%)
- Industry preference matching
- Career progression opportunities
- Role responsibility alignment
- Company culture compatibility

### 5. Location & Logistics (Weight: 10%)
- Geographic accessibility
- Transportation considerations
- Commute feasibility
- Regional accommodation standards

## Rating Scale:
- 9-10: PERFECT_MATCH - Exceptional alignment across all factors
- 7-8: GOOD_FIT - Strong match with minor considerations
- 5-6: SOME_INTEREST - Moderate fit with development potential
- 3-4: NOT_RELEVANT - Limited alignment, significant gaps
- 1-2: POOR_MATCH - Poor fit, multiple incompatibilities

## Feedback Guidelines:
- Use person-first, respectful language
- Focus on abilities and potential
- Highlight accommodation strengths
- Provide actionable improvement suggestions
- Emphasize inclusive workplace benefits
- Be encouraging while realistic

## Output Requirements:
1. Rank jobs by overall compatibility score
2. Provide detailed reasoning for each recommendation
3. Identify specific match factors and scores
4. Suggest skill development opportunities
5. Highlight accommodation considerations
6. Recommend next steps for applications

## Special Considerations:
- Prioritize jobs with explicit disability inclusion policies
- Consider remote work opportunities for mobility limitations
- Evaluate sensory accommodation availability
- Assess cognitive support and flexibility options
- Review mental health accommodation policies
- Consider career advancement accessibility

## Response Format:
Return recommendations as a structured JSON object matching the JobRecommendationOutput interface, ensuring all ratings, scores, and feedback are actionable and respectful.

Remember: Every individual has unique strengths and potential. Focus on empowerment, accessibility, and creating pathways to meaningful employment.
`;

export const generateJobRecommendationPrompt = (input: JobRecommendationInput): string => {
  const { userProfile, availableJobs, preferences } = input;
  
  const userProfileSummary = `
## User Profile Analysis:

### Basic Information:
- Name: ${userProfile.fullName || 'Not provided'}
- Location: ${userProfile.location || 'Not specified'}
- Contact: ${userProfile.email || 'Not provided'}

### Disability Profile:
- Disability Types: ${userProfile.disabilityTypes?.join(', ') || 'Not specified'}
- Support Needs: ${userProfile.supportNeeds || 'Not specified'}
- Assistive Technology: ${userProfile.assistiveTech?.join(', ') || 'None specified'}
- Accommodation Requirements: ${userProfile.accommodations || 'Not specified'}

### Skills & Preferences:
- Soft Skills: ${userProfile.softSkills?.join(', ') || 'Not specified'}
- Hard Skills: ${userProfile.hardSkills?.join(', ') || 'Not specified'}
- Target Industries: ${userProfile.industries?.join(', ') || 'Not specified'}
- Work Arrangement Preference: ${userProfile.workArrangement || 'Not specified'}

### Experience & Education:
- Education: ${JSON.stringify(userProfile.education) || 'Not provided'}
- Experience: ${JSON.stringify(userProfile.experience) || 'Not provided'}

### Documents:
- Resume Available: ${userProfile.resumeUrl ? 'Yes' : 'No'}
- Certifications: ${userProfile.certificationUrls?.length || 0} certificates

### Additional Context:
- Custom Summary: ${userProfile.customSummary || 'Not provided'}
- Additional Information: ${userProfile.additionalInfo || 'Not provided'}
`;

  const jobsSummary = `
## Available Jobs to Analyze:
${availableJobs.map((job, index) => `
### Job ${index + 1}: ${job.title}
- Company: ${job.company?.name || 'Unknown'}
- Location: ${job.location}
- Work Type: ${job.workType}
- Experience Level: ${job.experience}
- Remote: ${job.isRemote ? 'Yes' : 'No'}
- Hybrid: ${job.isHybrid ? 'Yes' : 'No'}
- Salary: ${job.salaryMin && job.salaryMax ? `$${job.salaryMin} - $${job.salaryMax} ${job.salaryCurrency}` : 'Not specified'}
- Accommodations: ${job.accommodations?.join(', ') || 'Not specified'}
- Accommodation Details: ${job.accommodationDetails || 'Not provided'}
- Requirements: ${job.requirements?.join(', ') || 'Not specified'}
- Preferred Skills: ${job.preferredSkills?.join(', ') || 'Not specified'}
- Benefits: ${job.benefits?.join(', ') || 'Not specified'}
- Application Process: ${job.applicationProcess?.join(', ') || 'Standard process'}
- Job ID: ${job.id}
`).join('\n')}
`;

  const preferencesSection = preferences ? `
## Analysis Preferences:
- Maximum Recommendations: ${preferences.maxRecommendations || 10}
- Minimum Match Score: ${preferences.minMatchScore || 50}%
- Prioritize Accommodations: ${preferences.prioritizeAccommodations ? 'Yes' : 'No'}
- Exclude Applied Jobs: ${preferences.excludeAppliedJobs?.join(', ') || 'None'}
` : '';

  return `${JOB_RECOMMENDATION_SYSTEM_PROMPT}

${userProfileSummary}

${jobsSummary}

${preferencesSection}

## Task:
Analyze each job against the user profile and provide personalized recommendations. Consider all factors including disability accommodations, skills alignment, work preferences, and career growth potential. Return your analysis in the exact JSON format specified in the JobRecommendationOutput interface.

Focus on creating meaningful, actionable recommendations that empower the user while being realistic about compatibility and growth opportunities.
`;
};

export const FOLLOW_UP_QUESTIONS_PROMPT = `
Based on the job recommendations provided, generate 3-5 thoughtful follow-up questions that would help refine future recommendations. Consider:

1. Accommodation preferences and experiences
2. Skill development interests
3. Work environment preferences
4. Career goals and aspirations
5. Specific industry interests
6. Compensation expectations
7. Geographic flexibility

Format as an array of strings with clear, respectful questions that show understanding of disability considerations.
`;
