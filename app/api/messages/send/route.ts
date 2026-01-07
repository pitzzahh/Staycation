import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/backend/controller/messageController";
import { createEdgeRouter } from "next-connect";

<<<<<<< HEAD
type RequestContext = Record<string, never>;
=======
interface RequestContext {}
>>>>>>> b8f4705e6ee02db94bf978711bf630a15c420c81

const router = createEdgeRouter<NextRequest, RequestContext>();
router.post(sendMessage);

export async function POST(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}
