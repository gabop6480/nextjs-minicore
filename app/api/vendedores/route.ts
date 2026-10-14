import { listVendedores } from "@/controllers/vendedorController";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    return Response.json({ success: true, data: await listVendedores() });
  } catch (error) {
    return errorResponse(error);
  }
}
