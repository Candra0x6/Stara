import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RecommendationRatingService } from "@/lib/services/recommendation-rating.service";

interface RouteParams {
  params: {
    userId: string;
    jobId: string;
  };
}

// GET /api/recommendation-ratings/user/[userId]/job/[jobId] - Get rating by user and job
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Users can only access their own ratings unless they're admin
    if (session.user.id !== params.userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You can only access your own ratings" },
        { status: 403 }
      );
    }

    const rating = await RecommendationRatingService.getRecommendationRatingByUserAndJob(
      params.userId,
      params.jobId
    );
    
    if (!rating) {
      return NextResponse.json(
        { error: "Recommendation rating not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rating);
  } catch (error) {
    console.error("Error fetching recommendation rating:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
