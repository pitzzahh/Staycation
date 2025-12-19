"use server";

import { NextRequest, NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import { checkWishlistStatus } from "@/backend/controller/wishlistController";

interface RequestContext {
  params: Promise<{
    userId: string;
    havenId: string;
  }>
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.get(checkWishlistStatus);

export async function GET(req: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(req, ctx) as Promise<NextResponse>;
}

