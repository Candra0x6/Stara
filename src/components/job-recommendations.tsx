/**
 * Job Recommendations Component
 * Displays AI-generated job recommendations with interactive features
 */

'use client';

import React, { useState } from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RefreshCw,
  Star,
  MapPin,
  Building,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Users,
  Accessibility,
  AlertCircle,
  CheckCircle,
  Loader2,
  Building2,
  Info,
  DollarSign,
  Headphones,
  Brain,
  Hand,
  ExternalLink,
  BookmarkCheck,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import BackButton from './blocks/navigation/back-button';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useJobActions } from '@/hooks/use-jobs';
interface JobRecommendationsProps {
  userId?: string;
  showAnalytics?: boolean;
  compact?: boolean;
}

const accommodationIcons: Record<string, { icon: any; label: string; color: string }> = {
  visual: { icon: Eye, label: "Visual accommodations", color: "blue" },
  hearing: { icon: Headphones, label: "Hearing accommodations", color: "purple" },
  mobility: { icon: Accessibility, label: "Mobility accommodations", color: "emerald" },
  cognitive: { icon: Brain, label: "Cognitive accommodations", color: "amber" },
  motor: { icon: Hand, label: "Motor accommodations", color: "rose" },
  social: { icon: Users, label: "Social accommodations", color: "cyan" },
}

export const JobRecommendations: React.FC<JobRecommendationsProps> = ({
  userId: propUserId,
  showAnalytics = false,
  compact = false,
}) => {
  const { session } = useAuth();
  const userId = propUserId || session?.user?.id;
  const { saveJob, unsaveJob, applyToJob, savedJobs } = useJobActions();

  const router = useRouter()
  const {
    recommendations,
    loading,
    error,
    regenerating,
    cached,
    generatedAt,
    analysis,
    fetchRecommendations,
    updateRecommendation,
    markHelpful,
    regenerateAll,
    clearError,
    getStats,
  } = useRecommendations(userId || '');
  const [showDetails, setShowDetails] = useState(false)
  const [showMatchReason, setShowMatchReason] = useState(false)

  const [feedbackDialog, setFeedbackDialog] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState([5]);
  const [reason, setReason] = useState<string>('');

  const stats = getStats();
  const isJobSaved = (jobId: string) => savedJobs.includes(jobId);
  const handleRatingUpdate = async (jobId: string) => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    const success = await updateRecommendation({
      jobId,
      rating: rating[0],
      feedback: feedback.trim(),
      reason: reason as any,
    });

    if (success) {
      toast.success('Thank you for your feedback!');
      setFeedbackDialog(null);
      setFeedback('');
      setRating([5]);
      setReason('');
    } else {
      toast.error('Failed to save feedback');
    }
  };

  const handleHelpfulClick = async (jobId: string, isHelpful: boolean) => {
    const success = await markHelpful(jobId, isHelpful);
    if (success) {
      toast.success(isHelpful ? 'Marked as helpful!' : 'Feedback recorded');
    }
  };

  console.log('recommendations', recommendations);

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    if (min) return `From $${min.toLocaleString()} ${currency}`;
    // @ts-ignore
    return `Up to $${max.toLocaleString()} ${currency}`;
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "from-emerald-500 to-green-500"
    if (score >= 75) return "from-blue-500 to-cyan-500"
    if (score >= 60) return "from-amber-500 to-yellow-500"
    return "from-rose-500 to-pink-500"
  }

  const getMatchTextColor = (score: number) => {
    if (score >= 90) return "text-emerald-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-amber-600"
    return "text-rose-600"
  }
  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobs.includes(jobId)) {
        await unsaveJob(jobId)
        toast.success("Job removed from saved jobs")
      } else {
        await saveJob(jobId)
        toast.success("Job saved successfully")
      }
    } catch (error) {
      toast.error("Failed to save job")
    }
  }

  const handleApplyJob = async (jobId: string) => {
    try {
      await applyToJob(jobId, {
        coverLetter: "",
        resumeUrl: "",
        accommodationNeeds: "",
      })
      toast.success("Application submitted successfully")
    } catch (error) {
      toast.error("Failed to submit application")
    }
  }

  if (!userId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to view job recommendations.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="ml-2"
          >
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto accessibility-text click-assist" role="main" aria-label="Job Recommendations">
      {/* Header */}
      <div className="">
        <BackButton title='Back to Job Listings' subtitle='Return to the main job listings page ' />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Job Recommendations</h2>
            <p className="text-muted-foreground">
              AI-powered job matches based on your profile
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {cached && generatedAt && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(generatedAt).toLocaleString()}
              </Badge>
            )}
            <Button
              onClick={() => regenerateAll()}
              disabled={loading || regenerating}
              variant="outline"
              size="sm"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {regenerating ? 'Generating...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {showAnalytics && !compact && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className='p-5'>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.totalRecommendations}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Helpful</p>
                  <p className="text-2xl font-bold">{stats.helpfulCount}</p>
                </div>
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Rated</p>
                  <p className="text-2xl font-bold">{stats.topRated.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Insights */}
      {analysis && !compact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              AI Analysis Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Top Matching Factors</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.topMatchingFactors.map((factor, index) => (
                  <Badge key={index} variant="secondary">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Skill Development Opportunities</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendedSkillImprovements.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Accommodation Insights</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.accommodationInsights.map((insight, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    <Accessibility className="h-3 w-3 mr-1" />
                    {insight}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && recommendations.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Analyzing your profile and finding the best job matches...
            </p>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => (

          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="group"
          >
            <Card className="rounded-2xl hover:shadow-lg transition-all duration-300 border-2 hover:border-primary bg-card">
              <CardContent className="p-6">
                <div onClick={() => setShowDetails(!showDetails)} className="">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {recommendation.job.title}
                        </h3>
                        {recommendation.job.workType && (
                          <Badge variant="secondary" className="bg-blue-100 text-primary rounded-full">
                            {recommendation.job.workType}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{recommendation.job.company.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{recommendation.job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {recommendation.job.closedAt
                              ? new Date(recommendation.job.closedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                              : 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="relative">
                      <motion.div
                        className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${getMatchColor(recommendation.matchScore as number)} p-0.5`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                          <span className={`text-sm font-bold ${getMatchTextColor(recommendation.matchScore as number)}`}>{recommendation.matchScore}%</span>
                        </div>
                      </motion.div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0 bg-background border shadow-sm hover:bg-background hover:text-foreground"
                        onClick={() => setShowMatchReason(!showMatchReason)}
                        aria-label="Show match explanation"
                      >
                        <Info className="h-3 w-3" />
                      </Button>

                      <AnimatePresence>
                        {showMatchReason && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-64 p-3 bg-popover border rounded-lg shadow-lg z-10"
                          >
                            <p className="text-sm text-popover-foreground">{recommendation.job.experience}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Accommodations */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">Accommodations:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.job.accommodations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Accessibility className="h-4 w-4 mr-2" />
                            Available Accommodations
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.job.accommodations.map((accommodation, index) => (
                              <Badge key={index} variant="outline" className="bg-green-50">
                                {accommodation.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Salary and Type */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(
                        recommendation.job.salaryMin || undefined,
                        recommendation.job.salaryMax || undefined,
                        recommendation.job.salaryCurrency
                      )}
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {recommendation.job.isHybrid}
                    </Badge>
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{recommendation.job.description}</p>
                  {recommendation.feedback && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-semibold mb-1 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        AI Recommendation
                      </h4>
                      <p className="text-sm">{recommendation.feedback}</p>
                      {recommendation.reason && (
                        <Badge variant="outline" className="mt-2">
                          {recommendation.reason.replace('_', ' ')}
                        </Badge>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"

                            onClick={() => handleHelpfulClick(recommendation.jobId, true)}
                            className={`
                              bg-transparent hover:bg-transparent border-none
                              ${recommendation.isHelpful === true ? 'text-primary hover:text-primary' : 'hover:text-black'}`}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleHelpfulClick(recommendation.jobId, false)}
                            className={`
                              bg-transparent hover:bg-transparent border-none
                              ${recommendation.isHelpful === false ? 'text-destructive hover:text-destructive' : 'hover:text-black'}`}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Not Helpful
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">


                          <Dialog
                            open={feedbackDialog === recommendation.jobId}
                            onOpenChange={(open) => setFeedbackDialog(open ? recommendation.jobId : null)}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rate this Recommendation</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Rating (1-10)</label>
                                  <Slider
                                    value={rating}
                                    onValueChange={setRating}
                                    max={10}
                                    min={1}
                                    step={1}
                                    className="mt-2"
                                  />
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Current rating: {rating[0]}/10
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Reason</label>
                                  <Select value={reason} onValueChange={setReason}>
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="Select a reason..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PERFECT_MATCH">Perfect Match</SelectItem>
                                      <SelectItem value="GOOD_FIT">Good Fit</SelectItem>
                                      <SelectItem value="SOME_INTEREST">Some Interest</SelectItem>
                                      <SelectItem value="NOT_RELEVANT">Not Relevant</SelectItem>
                                      <SelectItem value="POOR_MATCH">Poor Match</SelectItem>
                                      <SelectItem value="LOCATION_ISSUE">Location Issue</SelectItem>
                                      <SelectItem value="SALARY_MISMATCH">Salary Mismatch</SelectItem>
                                      <SelectItem value="SKILL_MISMATCH">Skill Mismatch</SelectItem>
                                      <SelectItem value="ACCOMMODATION_CONCERN">Accommodation Concern</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Feedback</label>
                                  <Textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us why you rated this recommendation this way..."
                                    className="mt-2"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() => setFeedbackDialog(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleRatingUpdate(recommendation.jobId)}
                                  >
                                    Submit Feedback
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  )}


                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-10">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/jobs/${recommendation.job.id}`)}
                    className="rounded-full transition-colors"
                  >
                    View Details
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveJob(recommendation.job.id)}
                      className={`rounded-full p-2 transition-colors ${isJobSaved(recommendation.job.id) ? "text-white bg-destructive border-none hover:bg-destructive" : "text-white"
                        }`}
                      aria-label={isJobSaved(recommendation.job.id) ? "Remove from saved jobs" : "Save job"}
                    >
                      {isJobSaved(recommendation.job.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </Button>

                    <Button
                      onClick={() => handleApplyJob(recommendation.job.id)}
                      className="bg-text-white rounded-full px-6 transition-all duration-300 hover:shadow-lg"
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>

                {/* Expandable Details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="mt-4 pt-4 border-t"
                    >
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Requirements:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {recommendation.job.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <ol className="list-disc pl-4">
                                  <li>{req}</li>
                                </ol>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Benefits:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {recommendation.job.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <ol className="list-disc pl-4">
                                  <li>{benefit}</li>
                                </ol>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <Card className="p-12 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete your profile to get personalized job recommendations.
          </p>
          <Button onClick={() => fetchRecommendations(true)}>
            Generate Recommendations
          </Button>
        </Card>
      )}
    </div>
  );
};
