import { describe, it, expect } from '@jest/globals'
import {
  ProfileSetupSchema,
  CreateProfileSetupSchema,
  UpdateProfileSetupSchema,
  Step1Schema,
  Step2Schema,
  Step3Schema,
  Step4Schema,
  Step5Schema,
  Step6Schema,
  validateStep,
  EducationEntrySchema,
  ExperienceEntrySchema,
  CertificationEntrySchema,
  ProfileSetupQuerySchema
} from '@/lib/validations/profile'
import { ZodError } from 'zod'

describe('Profile Validation Schemas', () => {
  
  describe('EducationEntrySchema', () => {
    it('should validate valid education entry', () => {
      const validEntry = {
        degree: 'Bachelor of Science',
        institution: 'University of Test',
        year: '2020',
        description: 'Computer Science degree'
      }

      const result = EducationEntrySchema.parse(validEntry)
      expect(result).toEqual(validEntry)
    })

    it('should allow empty education entry', () => {
      const emptyEntry = {}
      const result = EducationEntrySchema.parse(emptyEntry)
      expect(result).toEqual(emptyEntry)
    })
  })

  describe('ExperienceEntrySchema', () => {
    it('should validate valid experience entry', () => {
      const validEntry = {
        title: 'Software Developer',
        company: 'Tech Corp',
        duration: '2020-2023',
        description: 'Developed web applications'
      }

      const result = ExperienceEntrySchema.parse(validEntry)
      expect(result).toEqual(validEntry)
    })

    it('should allow empty experience entry', () => {
      const emptyEntry = {}
      const result = ExperienceEntrySchema.parse(emptyEntry)
      expect(result).toEqual(emptyEntry)
    })
  })

  describe('CertificationEntrySchema', () => {
    it('should validate valid certification entry', () => {
      const validEntry = {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023',
        url: 'https://aws.amazon.com/certification/'
      }

      const result = CertificationEntrySchema.parse(validEntry)
      expect(result).toEqual(validEntry)
    })

    it('should require name field', () => {
      const invalidEntry = {
        issuer: 'Amazon Web Services'
      }

      expect(() => CertificationEntrySchema.parse(invalidEntry)).toThrow(ZodError)
    })

    it('should validate URL format', () => {
      const invalidEntry = {
        name: 'AWS Certified Developer',
        url: 'invalid-url'
      }

      expect(() => CertificationEntrySchema.parse(invalidEntry)).toThrow(ZodError)
    })
  })

  describe('ProfileSetupSchema', () => {
    it('should validate complete valid profile setup', () => {
      const validProfile = {
        status: 'IN_PROGRESS',
        currentStep: 3,
        completedSteps: [1, 2],
        fullName: 'John Doe',
        preferredName: 'John',
        location: 'New York, NY',
        email: 'john@example.com',
        phone: '1234567890',
        disabilityTypes: ['Visual Impairment'],
        supportNeeds: 'Screen reader support',
        assistiveTech: ['Screen Reader'],
        accommodations: 'Flexible schedule',
        softSkills: ['Communication', 'Problem Solving'],
        hardSkills: ['JavaScript', 'React'],
        industries: ['Technology'],
        workArrangement: 'Remote',
        education: [{
          degree: 'BS Computer Science',
          institution: 'Test University',
          year: '2020'
        }],
        experience: [{
          title: 'Developer',
          company: 'Tech Inc',
          duration: '2020-2023'
        }],
        resumeUrl: 'https://example.com/resume.pdf',
        certifications: [{
          name: 'AWS Developer'
        }],
        customSummary: 'Experienced developer',
        additionalInfo: 'Additional information'
      }

      const result = ProfileSetupSchema.parse(validProfile)
      expect(result).toEqual(validProfile)
    })

    it('should allow partial profile setup', () => {
      const partialProfile = {
        fullName: 'John Doe',
        email: 'john@example.com'
      }

      const result = ProfileSetupSchema.parse(partialProfile)
      expect(result.fullName).toBe('John Doe')
      expect(result.email).toBe('john@example.com')
    })
  })

  describe('CreateProfileSetupSchema', () => {
    it('should require userId', () => {
      const profileData = {
        fullName: 'John Doe',
        email: 'john@example.com'
      }

      expect(() => CreateProfileSetupSchema.parse(profileData)).toThrow(ZodError)
    })

    it('should validate with userId', () => {
      const profileData = {
        userId: 'cljk1234567890abcdef',
        fullName: 'John Doe',
        email: 'john@example.com'
      }

      const result = CreateProfileSetupSchema.parse(profileData)
      expect(result.userId).toBe('cljk1234567890abcdef')
      expect(result.fullName).toBe('John Doe')
    })

    it('should validate userId format', () => {
      const profileData = {
        userId: 'invalid-id',
        fullName: 'John Doe'
      }

      expect(() => CreateProfileSetupSchema.parse(profileData)).toThrow(ZodError)
    })
  })

  describe('Step Validation Schemas', () => {
    describe('Step1Schema', () => {
      it('should validate valid step 1 data', () => {
        const validData = {
          fullName: 'John Doe',
          preferredName: 'John',
          location: 'New York, NY',
          email: 'john@example.com',
          phone: '1234567890'
        }

        const result = Step1Schema.parse(validData)
        expect(result).toEqual(validData)
      })

      it('should require required fields', () => {
        const invalidData = {
          preferredName: 'John'
        }

        expect(() => Step1Schema.parse(invalidData)).toThrow(ZodError)
      })

      it('should validate email format', () => {
        const invalidData = {
          fullName: 'John Doe',
          location: 'New York, NY',
          email: 'invalid-email',
          phone: '1234567890'
        }

        expect(() => Step1Schema.parse(invalidData)).toThrow(ZodError)
      })

      it('should validate minimum lengths', () => {
        const invalidData = {
          fullName: 'J',
          location: 'N',
          email: 'john@example.com',
          phone: '123'
        }

        expect(() => Step1Schema.parse(invalidData)).toThrow(ZodError)
      })
    })

    describe('Step2Schema', () => {
      it('should validate valid step 2 data', () => {
        const validData = {
          disabilityTypes: ['Visual Impairment', 'Hearing Impairment'],
          supportNeeds: 'Screen reader and captioning',
          assistiveTech: ['Screen Reader', 'Hearing Aids'],
          accommodations: 'Flexible schedule and remote work'
        }

        const result = Step2Schema.parse(validData)
        expect(result).toEqual(validData)
      })

      it('should require at least one disability type', () => {
        const invalidData = {
          disabilityTypes: [],
          supportNeeds: 'Some needs'
        }

        expect(() => Step2Schema.parse(invalidData)).toThrow(ZodError)
      })

      it('should allow optional fields to be undefined', () => {
        const validData = {
          disabilityTypes: ['Visual Impairment']
        }

        const result = Step2Schema.parse(validData)
        expect(result.disabilityTypes).toEqual(['Visual Impairment'])
      })
    })

    describe('Step3Schema', () => {
      it('should validate valid step 3 data', () => {
        const validData = {
          softSkills: ['Communication', 'Problem Solving'],
          hardSkills: ['JavaScript', 'React'],
          industries: ['Technology', 'Healthcare'],
          workArrangement: 'Remote'
        }

        const result = Step3Schema.parse(validData)
        expect(result).toEqual(validData)
      })

      it('should require at least one skill in each category', () => {
        const invalidData = {
          softSkills: [],
          hardSkills: ['JavaScript'],
          industries: ['Technology'],
          workArrangement: 'Remote'
        }

        expect(() => Step3Schema.parse(invalidData)).toThrow(ZodError)
      })

      it('should require work arrangement', () => {
        const invalidData = {
          softSkills: ['Communication'],
          hardSkills: ['JavaScript'],
          industries: ['Technology'],
          workArrangement: ''
        }

        expect(() => Step3Schema.parse(invalidData)).toThrow(ZodError)
      })
    })

    describe('Step4Schema', () => {
      it('should validate valid step 4 data', () => {
        const validData = {
          education: [{
            degree: 'BS Computer Science',
            institution: 'Test University',
            year: '2020',
            description: 'Focus on software engineering'
          }],
          experience: [{
            title: 'Software Developer',
            company: 'Tech Corp',
            duration: '2020-2023',
            description: 'Developed web applications'
          }]
        }

        const result = Step4Schema.parse(validData)
        expect(result).toEqual(validData)
      })

      it('should allow empty arrays', () => {
        const validData = {
          education: [],
          experience: []
        }

        const result = Step4Schema.parse(validData)
        expect(result.education).toEqual([])
        expect(result.experience).toEqual([])
      })

      it('should allow undefined fields', () => {
        const validData = {}

        const result = Step4Schema.parse(validData)
        expect(result).toEqual({})
      })
    })

    describe('Step5Schema', () => {
      it('should validate valid step 5 data', () => {
        const validData = {
          resumeUrl: 'https://example.com/resume.pdf',
          certifications: [{
            name: 'AWS Developer Certification',
            issuer: 'Amazon Web Services',
            date: '2023',
            url: 'https://aws.amazon.com/certification/'
          }]
        }

        const result = Step5Schema.parse(validData)
        expect(result).toEqual(validData)
      })

      it('should validate URL format', () => {
        const invalidData = {
          resumeUrl: 'invalid-url'
        }

        expect(() => Step5Schema.parse(invalidData)).toThrow(ZodError)
      })

      it('should allow undefined fields', () => {
        const validData = {}

        const result = Step5Schema.parse(validData)
        expect(result).toEqual({})
      })
    })

    describe('Step6Schema', () => {
      it('should validate valid step 6 data', () => {
        const validData = {
          customSummary: 'Experienced software developer with accessibility focus',
          additionalInfo: 'Available for immediate start'
        }

        const result = Step6Schema.parse(validData)
        expect(result).toEqual(validData)
      })

      it('should allow undefined fields', () => {
        const validData = {}

        const result = Step6Schema.parse(validData)
        expect(result).toEqual({})
      })
    })
  })

  describe('validateStep function', () => {
    it('should validate step 1 data', () => {
      const stepData = {
        fullName: 'John Doe',
        location: 'New York, NY',
        email: 'john@example.com',
        phone: '1234567890'
      }

      const result = validateStep(1, stepData)
      expect(result).toEqual(stepData)
    })

    it('should validate step 2 data', () => {
      const stepData = {
        disabilityTypes: ['Visual Impairment']
      }

      const result = validateStep(2, stepData)
      expect(result).toEqual(stepData)
    })

    it('should validate step 3 data', () => {
      const stepData = {
        softSkills: ['Communication'],
        hardSkills: ['JavaScript'],
        industries: ['Technology'],
        workArrangement: 'Remote'
      }

      const result = validateStep(3, stepData)
      expect(result).toEqual(stepData)
    })

    it('should validate step 4 data', () => {
      const stepData = {
        education: [],
        experience: []
      }

      const result = validateStep(4, stepData)
      expect(result).toEqual(stepData)
    })

    it('should validate step 5 data', () => {
      const stepData = {
        resumeUrl: 'https://example.com/resume.pdf'
      }

      const result = validateStep(5, stepData)
      expect(result).toEqual(stepData)
    })

    it('should validate step 6 data', () => {
      const stepData = {
        customSummary: 'Professional summary'
      }

      const result = validateStep(6, stepData)
      expect(result).toEqual(stepData)
    })

    it('should throw error for invalid step number', () => {
      expect(() => validateStep(7, {})).toThrow('Invalid step: 7')
      expect(() => validateStep(0, {})).toThrow('Invalid step: 0')
    })

    it('should throw validation error for invalid data', () => {
      const invalidData = {
        fullName: 'J' // Too short
      }

      expect(() => validateStep(1, invalidData)).toThrow(ZodError)
    })
  })

  describe('ProfileSetupQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        userId: 'cljk1234567890abcdef',
        status: 'COMPLETED',
        includeCompleted: 'true'
      }

      const result = ProfileSetupQuerySchema.parse(validQuery)
      expect(result.userId).toBe('cljk1234567890abcdef')
      expect(result.status).toBe('COMPLETED')
      expect(result.includeCompleted).toBe(true)
    })

    it('should allow partial query parameters', () => {
      const partialQuery = {
        status: 'IN_PROGRESS'
      }

      const result = ProfileSetupQuerySchema.parse(partialQuery)
      expect(result.status).toBe('IN_PROGRESS')
      expect(result.userId).toBeUndefined()
    })

    it('should transform includeCompleted string to boolean', () => {
      const query1 = { includeCompleted: 'true' }
      const result1 = ProfileSetupQuerySchema.parse(query1)
      expect(result1.includeCompleted).toBe(true)

      const query2 = { includeCompleted: 'false' }
      const result2 = ProfileSetupQuerySchema.parse(query2)
      expect(result2.includeCompleted).toBe(false)
    })

    it('should validate status enum values', () => {
      const invalidQuery = {
        status: 'INVALID_STATUS'
      }

      expect(() => ProfileSetupQuerySchema.parse(invalidQuery)).toThrow(ZodError)
    })
  })
})
