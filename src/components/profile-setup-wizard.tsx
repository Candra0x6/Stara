"use client";

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Save, User, Heart, Briefcase, GraduationCap, Upload, FileText, Plus, X, Play, Pause, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useProfileSetup } from '@/hooks/use-profile-setup';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileFileUpload } from '@/components/ui/profile-file-upload';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Complete form schema
const formSchema = z.object({
  // Basic Information
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  preferredName: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),

  // Disability Profile
  disabilityTypes: z.array(z.string()).min(1, 'Please select at least one disability type'),
  supportNeeds: z.string().optional(),
  assistiveTech: z.array(z.string()).optional(),
  accommodations: z.string().optional(),

  // Skills & Work Preferences
  softSkills: z.array(z.string()).min(1, 'Please select at least one soft skill'),
  hardSkills: z.array(z.string()).min(1, 'Please select at least one hard skill'),
  industries: z.array(z.string()).min(1, 'Please select at least one industry'),
  workArrangement: z.string().min(1, 'Please select your preferred work arrangement'),

  // Education & Experience
  education: z.array(z.object({
    degree: z.string().optional(),
    institution: z.string().optional(),
    year: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  experience: z.array(z.object({
    title: z.string().optional(),
    company: z.string().optional(),
    duration: z.string().optional(),
    description: z.string().optional(),
  })).optional(),

  // Documents
  resume: z.any().optional(),
  resumeUrl: z.string().optional(),
  certifications: z.array(z.any()).optional(),
  certificationUrls: z.array(z.string()).optional(),

  // Preview
  customSummary: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: 'Basic Info', icon: User, description: 'Tell us about yourself' },
  { id: 2, title: 'Disability Profile', icon: Heart, description: 'Share your support needs' },
  { id: 3, title: 'Skills & Work', icon: Briefcase, description: 'Your skills and preferences' },
  { id: 4, title: 'Education & Experience', icon: GraduationCap, description: 'Your background (optional)' },
  { id: 5, title: 'Upload Documents', icon: Upload, description: 'Add your documents (optional)' },
  { id: 6, title: 'Resume Preview', icon: FileText, description: 'Review and finalize' },
];

const disabilityTypes = [
  'Visual Impairment', 'Hearing Impairment', 'Mobility Impairment', 'Cognitive Disability',
  'Mental Health Condition', 'Chronic Illness', 'Learning Disability', 'Autism Spectrum',
  'Other', 'Prefer not to specify'
];

const assistiveTechOptions = [
  'Screen Reader', 'Voice Recognition', 'Keyboard Navigation', 'Text-to-Speech',
  'Magnification Software', 'Alternative Input Devices', 'Hearing Aids', 'Cochlear Implant',
  'Mobility Aids', 'Cognitive Support Tools', 'Other'
];

const softSkillsOptions = [
  'Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Time Management',
  'Adaptability', 'Critical Thinking', 'Creativity', 'Attention to Detail', 'Customer Service'
];

const hardSkillsOptions = [
  'Microsoft Office', 'Data Analysis', 'Programming', 'Project Management', 'Digital Marketing',
  'Graphic Design', 'Accounting', 'Sales', 'Research', 'Technical Writing'
];

const industryOptions = [
  'Technology', 'Healthcare', 'Education', 'Finance', 'Non-Profit', 'Government',
  'Retail', 'Manufacturing', 'Media', 'Professional Services'
];

const workArrangementOptions = [
  'Remote', 'Hybrid', 'On-site', 'Flexible'
];

export const ProfileSetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { session, isAuthenticated } = useAuth();
  const router = useRouter()
  const {
    profileSetup,
    loading,
    error,
    saving,
    updateStep,
    updateProfile,
    completeProfile,
    clearError,
    isCompleted,
    completedSteps,
    canProceedToNext,
    loadProfileSetup
  } = useProfileSetup();

  const [isPlaying, setIsPlaying] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [localLoading, setLocalLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      preferredName: '',
      location: '',
      email: '',
      phone: '',
      disabilityTypes: [],
      supportNeeds: '',
      assistiveTech: [],
      accommodations: '',
      softSkills: [],
      hardSkills: [],
      industries: [],
      workArrangement: '',
      education: [],
      experience: [],
      resume: undefined,
      resumeUrl: '',
      certifications: [],
      certificationUrls: [],
      customSummary: '',
      additionalInfo: '',
      ...formData,
    },
    mode: 'onChange',
  });

  // Load profile setup data into form when available
  useEffect(() => {
    if (profileSetup) {
      // Set current step from API data
      setCurrentStep(profileSetup.currentStep || 1);

      // Populate form with existing data
      const apiFormData = {
        fullName: profileSetup.fullName || '',
        preferredName: profileSetup.preferredName || '',
        location: profileSetup.location || '',
        email: profileSetup.email || '',
        phone: profileSetup.phone || '',
        disabilityTypes: profileSetup.disabilityTypes || [],
        supportNeeds: profileSetup.supportNeeds || '',
        assistiveTech: profileSetup.assistiveTech || [],
        accommodations: profileSetup.accommodations || '',
        softSkills: profileSetup.softSkills || [],
        hardSkills: profileSetup.hardSkills || [],
        industries: profileSetup.industries || [],
        workArrangement: profileSetup.workArrangement || '',
        education: profileSetup.education || [],
        experience: profileSetup.experience || [],
        resume: undefined, // File uploads handled separately
        resumeUrl: profileSetup.resumeUrl || '',
        certifications: profileSetup.certifications || [],
        certificationUrls: profileSetup.certificationUrls || [],
        customSummary: profileSetup.customSummary || '',
        additionalInfo: profileSetup.additionalInfo || '',
      };
      setFormData(apiFormData);
      form.reset(apiFormData);
    }



  }, [profileSetup, form]);

  // Load fallback from localStorage if no API data (for offline support)
  useEffect(() => {
    if (!profileSetup && !loading) {
      const saved = localStorage.getItem('profileWizardProgress');
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          setFormData(parsedData.formData || {});
          setCurrentStep(parsedData.currentStep || 1);
          form.reset(parsedData.formData || {});
        } catch (error) {
          console.error('Error parsing saved progress:', error);
        }
      }
    }

  }, [profileSetup, loading, form]);
;
  const completedSubmission = async () => {
    const currentData = { ...formData, ...form.getValues() };
    try {
      if (isAuthenticated ) {
        alert("aaas")
        const success = await updateProfile({
          ...currentData,
          currentStep,
          status: 'COMPLETED'
        });

        if (success) {
          toast.success('Profile setup completed successfully!');
          router.push('/jobs/recommendations')
          return true;
        } else {
          toast.error('Failed to complete profile setup');
          return false;
        }
      } else {
        // Fallback to localStorage if not aut
        toast.error('You must be logged in to complete your profile');
        return true;
      }
    }
    catch (error) {
      console.error('Error completing profile setup:', error);
      toast.error('An error occurred while completing your profile setup');
      return false;
    }
  };

  useEffect(() => {
    loadProfileSetup();
  }, []);

  // Save progress to API and localStorage
  const saveProgress = async () => {
    const currentData = { ...formData, ...form.getValues() };
    setLocalLoading(true);

    try {
      // Save to API if authenticated
     
        // Save to localStorage if not authenticated
        saveToLocalStorage(currentData);
        toast.success('Progress saved locally!');
      
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
      // Fallback to localStorage
      saveToLocalStorage(currentData);
    } finally {
      setLocalLoading(false);
    }
  };

  // Helper function to save to localStorage
  const saveToLocalStorage = (data: Partial<FormData>) => {
    try {
      localStorage.setItem('profileWizardProgress', JSON.stringify({
        formData: data,
        currentStep
      }));
      setFormData(data);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Audio description functionality
  const playAudioDescription = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;

      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
      }
    }
  };

  const nextStep = async () => {
    setLocalLoading(true);
    clearError(); // Clear any previous errors

    try {
      // Get current form values
      const currentValues = form.getValues();
      console.log('Current form values:', currentValues);

      // Validate current step
      let isValid = false;

      switch (currentStep) {
        case 1:
          isValid = await form.trigger(['fullName', 'location', 'email', 'phone']);
          break;
        case 2:
          isValid = await form.trigger(['disabilityTypes']);
          break;
        case 3:
          isValid = await form.trigger(['softSkills', 'hardSkills', 'industries', 'workArrangement']);
          break;
        case 4:
        case 5:
          // Optional steps - always valid
          isValid = true;
          break;
        case 6:
          isValid = true;
          break;
        default:
          isValid = true;
      }

      console.log('Form validation result:', isValid);
      console.log('Form errors:', form.formState.errors);

      if (isValid) {
        // Prepare step data based on current step
        let stepData = {};

        switch (currentStep) {
          case 1:
            stepData = {
              fullName: currentValues.fullName,
              preferredName: currentValues.preferredName,
              location: currentValues.location,
              email: currentValues.email,
              phone: currentValues.phone,
            };
            break;
          case 2:
            stepData = {
              disabilityTypes: currentValues.disabilityTypes,
              supportNeeds: currentValues.supportNeeds,
              assistiveTech: currentValues.assistiveTech,
              accommodations: currentValues.accommodations,
            };
            break;
          case 3:
            stepData = {
              softSkills: currentValues.softSkills,
              hardSkills: currentValues.hardSkills,
              industries: currentValues.industries,
              workArrangement: currentValues.workArrangement,
            };
            break;
          case 4:
            stepData = {
              education: currentValues.education,
              experience: currentValues.experience,
            };
            break;
          case 5:
            stepData = {
              resumeUrl: currentValues.resumeUrl,
              certificationUrls: currentValues.certificationUrls,
            };
            break;
          case 6:
            stepData = {
              customSummary: currentValues.customSummary,
              additionalInfo: currentValues.additionalInfo,
            };
            break;
        }

        if (currentStep < 6) {
          // Update the current step via API
          if (isAuthenticated ) {

            setCurrentStep(currentStep + 1);
            // Announce step change to screen readers
            const nextStepInfo = steps[currentStep];
            const announcement = `Moving to step ${currentStep + 1} of 6: ${nextStepInfo.title}. ${nextStepInfo.description}`;
            announceToScreenReader(announcement);
            toast.success(`Step ${currentStep} completed!`);

          } else {
            // Fallback to localStorage if not authenticated
            const updatedData = { ...formData, ...currentValues };
            saveToLocalStorage(updatedData);
            setCurrentStep(currentStep + 1);

            const nextStepInfo = steps[currentStep];
            const announcement = `Moving to step ${currentStep + 1} of 6: ${nextStepInfo.title}. ${nextStepInfo.description}`;
            announceToScreenReader(announcement);
          }
        }
      } else {
        // Scroll to first error
        const firstError = Object.keys(form.formState.errors)[0];
        const errorElement = document.querySelector(`[name="${firstError}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        toast.error('Please fix the errors before continuing');
      }
    } catch (error) {
      console.error('Error in nextStep:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Save current progress before going back
      saveProgress();
      setCurrentStep(currentStep - 1);
      // Announce step change to screen readers
      const prevStepInfo = steps[currentStep - 2];
      const announcement = `Moving back to step ${currentStep - 1} of 6: ${prevStepInfo.title}. ${prevStepInfo.description}`;
      announceToScreenReader(announcement);
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const addEducationEntry = () => {
    const currentEducation = form.getValues('education') || [];
    form.setValue('education', [...currentEducation, { degree: '', institution: '', year: '', description: '' }]);
  };

  const addExperienceEntry = () => {
    const currentExperience = form.getValues('experience') || [];
    form.setValue('experience', [...currentExperience, { title: '', company: '', duration: '', description: '' }]);
  };

  const removeEducationEntry = (index: number) => {
    const currentEducation = form.getValues('education') || [];
    form.setValue('education', currentEducation.filter((_, i) => i !== index));
  };

  const removeExperienceEntry = (index: number) => {
    const currentExperience = form.getValues('experience') || [];
    form.setValue('experience', currentExperience.filter((_, i) => i !== index));
  };

  const generateResumePreview = () => {
    const allData = { ...formData, ...form.getValues() };
    return {
      header: {
        name: allData.fullName || 'Your Name',
        email: allData.email || 'your.email@example.com',
        phone: allData.phone || 'Your Phone Number',
        location: allData.location || 'Your Location'
      },
      skills: {
        soft: allData.softSkills || [],
        hard: allData.hardSkills || []
      },
      education: allData.education || [],
      experience: allData.experience || [],
      preferences: {
        industries: allData.industries || [],
        workArrangement: allData.workArrangement || ''
      }
    };
  };

  const renderStep = () => {
    const currentStepData = steps[currentStep - 1];
    const audioDescription = `Step ${currentStep} of 6: ${currentStepData.title}. ${currentStepData.description}`;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-2">Basic Information</h2>
                <p className="text-muted-foreground">Tell us about yourself to get started</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playAudioDescription(audioDescription)}
                aria-label="Play audio description of current step"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-describedby="basic-info-description">
              <div id="basic-info-description" className="sr-only">
                This section collects your basic personal information including your full name, preferred name, location, email, and phone number.
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your legal name as it appears on official documents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Name</FormLabel>
                    <FormControl>
                      <Input placeholder="What would you like to be called?" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name you'd prefer to use in professional settings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State/Province, Country" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your current location for job matching
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your professional email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your preferred contact number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-2">Disability Profile</h2>
                <p className="text-muted-foreground">Help us understand your support needs</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playAudioDescription(audioDescription)}
                aria-label="Play audio description of current step"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-6" aria-describedby="disability-profile-description">
              <div id="disability-profile-description" className="sr-only">
                This section helps us understand your disability profile, support needs, assistive technology use, and workplace accommodations.
              </div>

              <FormField
                control={form.control}
                name="disabilityTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disability Type(s) *</FormLabel>
                    <FormDescription>
                      Select all that apply to your situation
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {disabilityTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={Array.isArray(field.value) && field.value.includes(type)}
                            onCheckedChange={(checked) => {
                              const currentValue = Array.isArray(field.value) ? field.value : [];
                              if (checked) {
                                field.onChange([...currentValue, type]);
                              } else {
                                field.onChange(currentValue.filter((v) => v !== type));
                              }
                            }}
                          />
                          <label htmlFor={type} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
           
              <FormField
                control={form.control}
                name="assistiveTech"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistive Technology Used</FormLabel>
                    <FormDescription>
                      Select the assistive technologies you use
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {assistiveTechOptions.map((tech) => (
                        <div key={tech} className="flex items-center space-x-2">
                          <Checkbox
                            id={tech}
                            checked={Array.isArray(field.value) && field.value.includes(tech)}
                            onCheckedChange={(checked) => {
                              const currentValue = Array.isArray(field.value) ? field.value : [];
                              if (checked) {
                                field.onChange([...currentValue, tech]);
                              } else {
                                field.onChange(currentValue.filter((v) => v !== tech));
                              }
                            }}
                          />
                          <label htmlFor={tech} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {tech}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="accommodations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workplace Accommodations</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any workplace accommodations you may need..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Describe accommodations that would help you succeed at work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-2">Skills & Work Preferences</h2>
                <p className="text-muted-foreground">Tell us about your skills and what you're looking for</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playAudioDescription(audioDescription)}
                aria-label="Play audio description of current step"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-6" aria-describedby="skills-work-description">
              <div id="skills-work-description" className="sr-only">
                This section captures your soft skills, hard skills, job preferences, industries of interest, and preferred work arrangements.
              </div>

              <FormField
                control={form.control}
                name="softSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soft Skills *</FormLabel>
                    <FormDescription>
                      Select your strongest soft skills
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {softSkillsOptions.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={skill}
                            checked={Array.isArray(field.value) && field.value.includes(skill)}
                            onCheckedChange={(checked) => {
                              const currentValue = Array.isArray(field.value) ? field.value : [];
                              if (checked) {
                                field.onChange([...currentValue, skill]);
                              } else {
                                field.onChange(currentValue.filter((v) => v !== skill));
                              }
                            }}
                          />
                          <label htmlFor={skill} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hardSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hard Skills *</FormLabel>
                    <FormDescription>
                      Select your technical and professional skills
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {hardSkillsOptions.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={skill}
                            checked={Array.isArray(field.value) && field.value.includes(skill)}
                            onCheckedChange={(checked) => {
                              const currentValue = Array.isArray(field.value) ? field.value : [];
                              if (checked) {
                                field.onChange([...currentValue, skill]);
                              } else {
                                field.onChange(currentValue.filter((v) => v !== skill));
                              }
                            }}
                          />
                          <label htmlFor={skill} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industries of Interest *</FormLabel>
                    <FormDescription>
                      Select industries you'd like to work in
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {industryOptions.map((industry) => (
                        <div key={industry} className="flex items-center space-x-2">
                          <Checkbox
                            id={industry} 
                            checked={Array.isArray(field.value) && field.value.includes(industry)}
                            onCheckedChange={(checked) => {
                              const currentValue = Array.isArray(field.value) ? field.value : [];
                              if (checked) {
                                field.onChange([...currentValue, industry]);
                              } else {
                                field.onChange(currentValue.filter((v) => v !== industry));
                              }
                            }}
                          />
                          <label htmlFor={industry} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {industry}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workArrangement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Work Arrangement *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='text-foreground'>

                          <SelectValue placeholder="Select your preferred work arrangement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workArrangementOptions.map((arrangement) => (
                          <SelectItem key={arrangement} value={arrangement}>
                            {arrangement}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the work arrangement that works best for you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-2">Education & Experience</h2>
                <p className="text-muted-foreground">Add your background (optional)</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playAudioDescription(audioDescription)}
                aria-label="Play audio description of current step"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-8" aria-describedby="education-experience-description">
              <div id="education-experience-description" className="sr-only">
                This optional section allows you to add your educational background and work experience.
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Education</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducationEntry}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>

                {(form.watch('education') || []).map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Education Entry {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducationEntry(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`education.${index}.degree`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree/Certificate</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Bachelor of Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`education.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., University of Example" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`education.${index}.year`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2020" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`education.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional details about your education..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Work Experience</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExperienceEntry}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>

                {(form.watch('experience') || []).map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Experience Entry {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperienceEntry(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`experience.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Software Developer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experience.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Tech Company Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experience.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2020-2023" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experience.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your responsibilities and achievements..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-2">Upload Documents</h2>
                <p className="text-muted-foreground">Add your resume and certifications (optional)</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playAudioDescription(audioDescription)}
                aria-label="Play audio description of current step"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-6 h-full" aria-describedby="documents-description">
              <div id="documents-description" className="sr-only">
                This optional section allows you to upload your resume, CV, and any certifications.
              </div>

              {/* Resume Upload */}
              <div className="h-full space-y-">

              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem>
                    <ProfileFileUpload
                      type="resume"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading || saving}
                      label="Resume/CV"
                      description="Upload your current resume or CV (PDF, DOC, or DOCX, max 10MB)"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Certifications Upload */}
              <FormField
                control={form.control}
                name="certificationUrls"
                render={({ field }) => (
                  <FormItem>
                    <ProfileFileUpload
                      type="certification"
                      value={field.value}
                      onChange={field.onChange}
                      multiple={true}
                      disabled={loading || saving}
                      label="Certifications"
                      description="Upload relevant certifications or credentials (PDF, DOC, DOCX, JPG, PNG, max 10MB each)"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Don't have documents yet?
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  No problem! Document uploads are optional. You can always add them later from your profile.
                </p>
              </div>
            </div>
          </div>
        );

      case 6:
        const resumeData = generateResumePreview();
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-2">Resume Preview</h2>
                <p className="text-muted-foreground">Review and finalize your profile</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playAudioDescription(audioDescription)}
                aria-label="Play audio description of current step"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-6" aria-describedby="resume-preview-description">
              <div id="resume-preview-description" className="sr-only">
                This section shows a preview of your generated resume based on all the information you've provided.
              </div>

              <Card className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b pb-4">
                    <h1 className="text-3xl font-bold text-primary">{resumeData.header.name}</h1>
                    <div className="flex justify-center items-center space-x-4 mt-2 text-muted-foreground">
                      <span>{resumeData.header.email}</span>
                      <span>•</span>
                      <span>{resumeData.header.phone}</span>
                      <span>•</span>
                      <span>{resumeData.header.location}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-3">Skills</h2>
                    <div className="space-y-3">
                      {resumeData.skills.soft.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Soft Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.soft.map((skill, index) => (
                              <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {resumeData.skills.hard.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Technical Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.hard.map((skill, index) => (
                              <Badge key={index} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-primary mb-3">Experience</h2>
                      <div className="space-y-4">
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-accent pl-4">
                            <h3 className="font-medium">{exp.title}</h3>
                            <p className="text-muted-foreground">{exp.company} • {exp.duration}</p>
                            {exp.description && (
                              <p className="text-sm mt-1">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-primary mb-3">Education</h2>
                      <div className="space-y-4">
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-accent pl-4">
                            <h3 className="font-medium">{edu.degree}</h3>
                            <p className="text-muted-foreground">{edu.institution} • {edu.year}</p>
                            {edu.description && (
                              <p className="text-sm mt-1">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferences */}
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-3">Work Preferences</h2>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Preferred Industries: </span>
                        <span className="text-muted-foreground">
                          {resumeData.preferences.industries.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Work Arrangement: </span>
                        <span className="text-muted-foreground">
                          {resumeData.preferences.workArrangement}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <FormField
                control={form.control}
                name="customSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Summary (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a brief professional summary to highlight your key strengths..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will appear at the top of your resume
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information you'd like to include..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Languages, volunteer work, awards, or other relevant information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Profile Setup Wizard</h1>
        <p className="text-muted-foreground">
          Complete your profile to get started with personalized job matching
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2 p-1 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Loading your profile setup...
          </AlertDescription>
        </Alert>
      )}

      {/* Authentication Warning */}
      {!isAuthenticated  && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're not signed in. Your progress will be saved locally, but sign in to sync across devices.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />

        {/* Step indicators */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index + 1 === currentStep;
            const isCompleted = completedSteps.includes(index + 1);
            const isPast = index + 1 < currentStep;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${isActive ? 'text-accent' : isCompleted || isPast ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative ${isActive
                      ? 'border-accent bg-accent text-white'
                      : isCompleted
                        ? 'border-primary bg-primary text-white'
                        : isPast
                          ? 'border-primary bg-primary text-white'
                          : 'border-muted-foreground'
                    }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium text-center hidden sm:block">
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-6 h-fit flex flex-col">
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => { })}>
              {renderStep()}
            </form>
          </Form>
        </FormProvider>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="default"
            onClick={saveProgress}
            disabled={localLoading || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving || localLoading ? 'Saving...' : 'Save Progress'}
          </Button>

          {(currentStep === 4 || currentStep === 5) && (
            <Button
              type="button"
              variant="ghost"
              onClick={nextStep}
              disabled={localLoading || saving}
            >
              Skip Step
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="default"
            onClick={prevStep}
            disabled={currentStep === 1 || localLoading || saving}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            type="button"
            className='cursor-pointer'
            onClick={() => {
              if (currentStep === 6) {
                completedSubmission();
              } else {
                nextStep();
              }
            }}
            disabled={localLoading || saving}
          >
            {saving || localLoading ? (
              'Processing...'
            ) : currentStep === 6 ? (
              'Complete Profile'
            ) : (
              'Next'
            )}
            {currentStep !== 6 && !saving && !localLoading && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};