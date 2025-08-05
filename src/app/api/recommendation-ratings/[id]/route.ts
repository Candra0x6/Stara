import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RecommendationRatingService } from "@/lib/services/recommendation-rating.service";
import { UpdateRecommendationRatingSchema } from "@/lib/validations/recommendation-rating";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/recommendation-ratings/[id] - Get a specific recommendation rating
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    const { id } = await params;
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rating = await RecommendationRatingService.getRecommendationRatingById(id);
    
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

// PUT /api/recommendation-ratings/[id] - Update a recommendation rating
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    const { id } = await params;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateRecommendationRatingSchema.parse(body);
    
    const rating = await RecommendationRatingService.updateRecommendationRating(
      id,
      session.user.id,
      validatedData
    );
    
    return NextResponse.json(rating);
  } catch (error) {
    console.error("Error updating recommendation rating:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/recommendation-ratings/[id] - Delete a recommendation rating
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    const { id } = await params;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await RecommendationRatingService.deleteRecommendationRating(
      id,
      session.user.id
    );
    
    return NextResponse.json(
      { message: "Recommendation rating deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting recommendation rating:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
