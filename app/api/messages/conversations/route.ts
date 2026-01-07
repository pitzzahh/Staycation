import { NextRequest, NextResponse } from "next/server";
import { getConversations, createConversation } from "@/backend/controller/messageController";
import { createEdgeRouter } from "next-connect";

<<<<<<< HEAD
type RequestContext = Record<string, never>;
=======
interface RequestContext {}
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81

const router = createEdgeRouter<NextRequest, RequestContext>();
router.get(getConversations);
router.post(createConversation);

export async function GET(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}

export async function POST(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}
