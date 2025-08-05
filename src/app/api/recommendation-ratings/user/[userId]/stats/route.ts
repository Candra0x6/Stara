import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RecommendationRatingService } from "@/lib/services/recommendation-rating.service";

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

// GET /api/recommendation-ratings/user/[userId]/stats - Get user's rating statistics
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    const { userId } = await params;
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Users can only access their own stats unless they're admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You can only access your own statistics" },
        { status: 403 }
      );
    }

    const stats = await RecommendationRatingService.getUserRatingStats(userId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user rating statistics:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
