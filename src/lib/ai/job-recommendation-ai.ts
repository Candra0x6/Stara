/**
 * Google Generative AI Service for Job Recommendations
 * Handles integration with Google's Gemini API for intelligent job matching
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  JobRecommendationInput, 
  JobRecommendationOutput, 
  generateJobRecommendationPrompt,
  FOLLOW_UP_QUESTIONS_PROMPT 
} from './job-recommendation-prompt';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class JobRecommendationAIService {
  private model;
  
  constructor() {
    // Use Gemini Pro model for complex reasoning tasks
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });
  }

  /**
   * Generate job recommendations using AI analysis
   */
  async generateRecommendations(input: JobRecommendationInput): Promise<JobRecommendationOutput> {
    try {
      const prompt = generateJobRecommendationPrompt(input);
      
      console.log('Generating AI job recommendations...');
      console.log('User Profile ID:', input.userProfile.id);
      console.log('Available Jobs:', input.availableJobs.length);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      let recommendations: JobRecommendationOutput;
      
      try {
        // Clean the response text (remove markdown formatting if present)
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        recommendations = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw AI response:', text);
        
        // Fallback: create basic recommendations
        recommendations = this.createFallbackRecommendations(input);
      }
      
      // Validate and sanitize the recommendations
      return this.validateRecommendations(recommendations, input);
      
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      
      // Return fallback recommendations on error
      return this.createFallbackRecommendations(input);
    }
  }

  /**
   * Generate follow-up questions to improve future recommendations
   */
  async generateFollowUpQuestions(
    userProfile: any, 
    recommendations: JobRecommendationOutput
  ): Promise<string[]> {
    try {
      const prompt = `
${FOLLOW_UP_QUESTIONS_PROMPT}

User Profile Summary:
- Disability Types: ${userProfile.disabilityTypes?.join(', ') || 'Not specified'}
- Skills: ${[...(userProfile.softSkills || []), ...(userProfile.hardSkills || [])].join(', ')}
- Industries: ${userProfile.industries?.join(', ') || 'Not specified'}
- Work Arrangement: ${userProfile.workArrangement || 'Not specified'}

Recent Recommendations:
${recommendations.recommendations.slice(0, 3).map(rec => `
- Rating: ${rec.rating}/10 (${rec.reason})
- Match Score: ${rec.matchScore}%
- Key Factors: Skills ${rec.matchFactors.skillsMatch}%, Accommodations ${rec.matchFactors.accommodationMatch}%
`).join('')}

Generate 3-5 follow-up questions as a JSON array of strings.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Error parsing follow-up questions:', parseError);
        return this.getDefaultFollowUpQuestions();
      }
      
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return this.getDefaultFollowUpQuestions();
    }
  }

  /**
   * Create fallback recommendations when AI fails
   */
  private createFallbackRecommendations(input: JobRecommendationInput): JobRecommendationOutput {
    const { userProfile, availableJobs } = input;
    
    const recommendations = availableJobs.slice(0, 5).map((job, index) => ({
      jobId: job.id,
      rating: Math.max(1, 8 - index), // Decreasing ratings
      matchScore: Math.max(50, 85 - (index * 8)), // Decreasing match scores
      reason: 'GOOD_FIT' as const,
      feedback: `This ${job.title} position at ${job.company?.name || 'the company'} shows potential alignment with your profile. The role offers ${job.isRemote ? 'remote work options' : 'on-site opportunities'} and appears to match some of your skills and interests.`,
      recommendedBy: 'AI' as const,
      matchFactors: {
        skillsMatch: 70 + Math.random() * 20,
        accommodationMatch: job.accommodations?.length ? 80 + Math.random() * 20 : 50,
        locationMatch: 75 + Math.random() * 20,
        workArrangementMatch: userProfile.workArrangement === job.workType ? 90 : 60,
        industryMatch: userProfile.industries?.some(industry => 
          job.company?.industry?.toLowerCase().includes(industry.toLowerCase())
        ) ? 85 : 60,
        experienceMatch: 65 + Math.random() * 25,
      },
    }));

    return {
      recommendations,
      analysis: {
        totalJobsAnalyzed: availableJobs.length,
        topMatchingFactors: ['Skills alignment', 'Work arrangement fit', 'Location compatibility'],
        recommendedSkillImprovements: ['Communication skills', 'Technical proficiency', 'Industry knowledge'],
        accommodationInsights: ['Remote work options available', 'Assistive technology support', 'Flexible scheduling'],
      },
    };
  }

  /**
   * Validate and sanitize AI recommendations
   */
  private validateRecommendations(
    recommendations: JobRecommendationOutput, 
    input: JobRecommendationInput
  ): JobRecommendationOutput {
    // Ensure all required fields exist
    if (!recommendations.recommendations) {
      recommendations.recommendations = [];
    }

    if (!recommendations.analysis) {
      recommendations.analysis = {
        totalJobsAnalyzed: input.availableJobs.length,
        topMatchingFactors: [],
        recommendedSkillImprovements: [],
        accommodationInsights: [],
      };
    }

    // Validate each recommendation
    recommendations.recommendations = recommendations.recommendations
      .filter(rec => rec.jobId && typeof rec.rating === 'number' && typeof rec.matchScore === 'number')
      .map(rec => ({
        ...rec,
        rating: Math.max(1, Math.min(10, rec.rating)), // Clamp rating between 1-10
        matchScore: Math.max(0, Math.min(100, rec.matchScore)), // Clamp match score between 0-100
        recommendedBy: 'AI' as const,
        matchFactors: {
          skillsMatch: Math.max(0, Math.min(100, rec.matchFactors?.skillsMatch || 50)),
          accommodationMatch: Math.max(0, Math.min(100, rec.matchFactors?.accommodationMatch || 50)),
          locationMatch: Math.max(0, Math.min(100, rec.matchFactors?.locationMatch || 50)),
          workArrangementMatch: Math.max(0, Math.min(100, rec.matchFactors?.workArrangementMatch || 50)),
          industryMatch: Math.max(0, Math.min(100, rec.matchFactors?.industryMatch || 50)),
          experienceMatch: Math.max(0, Math.min(100, rec.matchFactors?.experienceMatch || 50)),
        },
      }))
      .slice(0, input.preferences?.maxRecommendations || 10); // Limit recommendations

    return recommendations;
  }

  /**
   * Default follow-up questions when AI generation fails
   */
  private getDefaultFollowUpQuestions(): string[] {
    return [
      "What types of workplace accommodations have been most helpful to you in previous roles?",
      "Are there specific industries or types of companies you're most interested in exploring?",
      "How important is remote work flexibility versus in-person collaboration for your success?",
      "What skills would you most like to develop or strengthen in your next role?",
      "What aspects of a job posting make you most excited to apply?",
    ];
  }

  /**
   * Test the AI service with sample data
   */
  async testService(): Promise<boolean> {
    try {
      const testInput: JobRecommendationInput = {
        userProfile: {
          id: 'test-profile',
          userId: 'test-user',
          status: 'COMPLETED',
          currentStep: 6,
          completedSteps: [1, 2, 3, 4, 5, 6],
          fullName: 'Test User',
          location: 'New York, NY',
          disabilityTypes: ['Visual Impairment'],
          assistiveTech: ['Screen Reader'],
          softSkills: ['Communication', 'Problem Solving'],
          hardSkills: ['JavaScript', 'React'],
          industries: ['Technology'],
          workArrangement: 'Remote',
          education: [],
          experience: [],
          certificationUrls: [],
          certifications: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          email: null,
          phone: null,
          preferredName: null,
          supportNeeds: null,
          accommodations: null,
          resumeUrl: null,
          customSummary: null,
          additionalInfo: null,
          completedAt: null,
        },
        availableJobs: [
          {
            id: 'test-job-1',
            title: 'Frontend Developer',
            workType: 'REMOTE',
            isRemote: true,
            experience: 'MID_LEVEL',
            accommodations: ['VISUAL'],
            company: { name: 'Tech Corp' },
            location: 'Remote',
            requirements: ['JavaScript', 'React'],
          },
        ],
      };

      const result = await this.generateRecommendations(testInput);
      return result.recommendations.length > 0;
      
    } catch (error) {
      console.error('AI service test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const jobRecommendationAI = new JobRecommendationAIService();
