import mongoose from "mongoose";
import { HttpError } from "@/lib/errors";

/** Convierte cualquier error en una respuesta JSON consistente. */
export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json({ success: false, error: error.message }, { status: error.status });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const first = Object.values(error.errors)[0]?.message ?? "Datos inválidos";
    return Response.json({ success: false, error: first }, { status: 400 });
  }
  console.error(error);
  return Response.json(
    { success: false, error: "Error interno del servidor" },
    { status: 500 }
  );
}
