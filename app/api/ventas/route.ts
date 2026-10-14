import { createVenta, listVentas } from "@/controllers/ventaController";
import { errorResponse } from "@/lib/api";

// GET /api/ventas?fecha_inicio=2025-06-01&fecha_fin=2025-06-30
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ventas = await listVentas(searchParams.get("fecha_inicio"), searchParams.get("fecha_fin"));
    return Response.json({ success: true, data: ventas });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const venta = await createVenta(await request.json());
    return Response.json({ success: true, data: venta }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
