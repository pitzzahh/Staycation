"use server";

import { NextRequest, NextResponse } from "next/server";
import { removeFromWishlist } from "@/backend/controller/wishlistController";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return removeFromWishlist(request, { params });
}
