"use server";

import { NextRequest, NextResponse } from "next/server";
import { getUserBookings } from "@/backend/controller/bookingController";
import { createEdgeRouter } from "next-connect";

interface RequestContext {
  params: Promise<{
    userId: string;
  }>
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.get(getUserBookings);

export async function GET(req: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(req, ctx) as Promise<NextResponse>;
}
