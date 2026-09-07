export async function GET() {
  return Response.json({ error: "OAuth callback is not implemented" }, { status: 501 });
}
