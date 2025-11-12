export async function GET() {
  return Response.json({
    rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
  });
}
