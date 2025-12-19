"use server";

import { NextRequest, NextResponse } from "next/server";
import { getUserWishlist } from "@/backend/controller/wishlistController";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  return getUserWishlist(request, { params });
}
