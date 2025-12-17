import { createHaven } from "@/backend/controller/roomController";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {};

const router = createEdgeRouter<NextRequest, RequestContext>();

router.post(createHaven);

export async function POST (req: NextRequest, ctx: RequestContext):Promise<NextResponse> {
    return router.run(req, ctx) as Promise<NextResponse>
}   