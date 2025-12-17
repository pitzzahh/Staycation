import { createEdgeRouter } from 'next-connect';
import { NextRequest, NextResponse } from 'next/server';
import { createEmployee, getAllEmployees } from '@/backend/controller/employeeController';

interface RequestContext {};

const router = createEdgeRouter<NextRequest, RequestContext>();

router.get(getAllEmployees)
router.post(createEmployee);

export async function GET (request: NextRequest, ctx: RequestContext):Promise<NextResponse> {
    return router.run(request, ctx) as Promise<NextResponse>
}

export async function POST (request: NextRequest, ctx: RequestContext):Promise<NextResponse> {
    return router.run(request, ctx) as Promise<NextResponse>
}