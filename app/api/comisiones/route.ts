import { calcularComisiones } from "@/controllers/comisionController";
import { errorResponse } from "@/lib/api";

// GET /api/comisiones?fecha_inicio=2025-06-01&fecha_fin=2025-06-30
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await calcularComisiones(
      searchParams.get("fecha_inicio"),
      searchParams.get("fecha_fin")
    );
    return Response.json({ success: true, data });
  } catch (error) {
    return errorResponse(error);
  }
}
