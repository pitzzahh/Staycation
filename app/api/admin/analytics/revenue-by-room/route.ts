import { NextRequest, NextResponse } from "next/server";
import { getRevenueByRoom } from "@/backend/controller/analyticsController";
import { createEdgeRouter } from "next-connect";

<<<<<<< HEAD
type RequestContext = Record<string, never>;
=======
interface RequestContext {}
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81

const router = createEdgeRouter<NextRequest, RequestContext>();
router.get(getRevenueByRoom);

export async function GET(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}
