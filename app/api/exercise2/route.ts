import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
    min: 1.99,
    max: 70.99,
  });
}
