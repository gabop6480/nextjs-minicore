import { cargarDatosEjemplo } from "@/controllers/datosController";
import { errorResponse } from "@/lib/api";

export async function POST() {
  try {
    return Response.json({ success: true, data: await cargarDatosEjemplo() }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
