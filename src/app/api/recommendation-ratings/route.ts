import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RecommendationRatingService } from "@/lib/services/recommendation-rating.service";
import { 
  CreateRecommendationRatingSchema,
  RecommendationRatingQuerySchema 
} from "@/lib/validations/recommendation-rating";

// GET /api/recommendation-ratings - Get all recommendation ratings with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedQuery = RecommendationRatingQuerySchema.parse(queryParams);
    
    const result = await RecommendationRatingService.getRecommendationRatings(validatedQuery);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching recommendation ratings:", error);
    
    if (error instanceof Error) {
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

// POST /api/recommendation-ratings - Create a new recommendation rating
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateRecommendationRatingSchema.parse(body);
    
    const rating = await RecommendationRatingService.createRecommendationRating(
      session.user.id,
      validatedData
    );
    
    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error creating recommendation rating:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
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
