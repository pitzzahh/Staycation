"use server";

import { NextRequest, NextResponse } from "next/server";
import { getEmployeeById } from "@/backend/controller/employeeController";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return getEmployeeById(request);
}
