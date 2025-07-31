import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RecommendationRatingService } from "@/lib/services/recommendation-rating.service";

interface RouteParams {
  params: {
    jobId: string;
  };
}

// GET /api/recommendation-ratings/job/[jobId]/stats - Get job's rating statistics
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

    const stats = await RecommendationRatingService.getJobRatingStats(params.jobId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching job rating statistics:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
