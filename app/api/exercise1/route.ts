import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ min: 1, max: 100 });
}
