import { listReglas } from "@/controllers/reglaController";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    return Response.json({ success: true, data: await listReglas() });
  } catch (error) {
    return errorResponse(error);
  }
}
