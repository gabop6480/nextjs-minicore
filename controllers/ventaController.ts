import dbConnect from "@/lib/mongodb";
import { HttpError } from "@/lib/errors";
import { round2 } from "@/lib/comisiones";
import { parseDia, rangoDeFechas } from "@/lib/fechas";
import { assertValidId, text, toNumber } from "@/lib/validate";
import Vendedor from "@/models/Vendedor";
import Venta from "@/models/Venta";

/** Ventas dentro de un rango de fechas (ambos días incluidos). */
export async function listVentas(fechaInicio: unknown, fechaFin: unknown) {
  const { inicio, fin } = rangoDeFechas(fechaInicio, fechaFin);
  await dbConnect();
  return Venta.find({ fecha: { $gte: inicio, $lte: fin } })
    .populate("vendedorId", "nombre")
    .sort({ fecha: -1, createdAt: -1 });
}

/** Registra una venta nueva. */
export async function createVenta(body: { vendedorId?: unknown; fecha?: unknown; monto?: unknown }) {
  const vendedorId = text(body.vendedorId);
  assertValidId(vendedorId, "Vendedor");

  const fecha = parseDia(body.fecha, "Fecha");
  const monto = toNumber(body.monto);
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new HttpError(400, "El monto debe ser un número mayor que 0");
  }

  await dbConnect();
  if (!(await Vendedor.exists({ _id: vendedorId }))) {
    throw new HttpError(400, "El vendedor seleccionado no existe");
  }

  const venta = await Venta.create({ vendedorId, fecha, monto: round2(monto) });
  return venta.populate("vendedorId", "nombre");
}
