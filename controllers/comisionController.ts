import { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import { calcularComision, round2 } from "@/lib/comisiones";
import { rangoDeFechas } from "@/lib/fechas";
import Regla from "@/models/Regla";
import Vendedor from "@/models/Vendedor";
import Venta from "@/models/Venta";

/**
 * Comisiones por vendedor en un rango de fechas:
 * 1) suma las ventas de cada vendedor dentro del rango,
 * 2) aplica la regla con el monto mínimo más alto que no supere ese total,
 * 3) comisión = total * porcentaje / 100.
 */
export async function calcularComisiones(fechaInicio: unknown, fechaFin: unknown) {
  const { inicio, fin } = rangoDeFechas(fechaInicio, fechaFin);
  await dbConnect();

  const [vendedores, reglas, totales] = await Promise.all([
    Vendedor.find().sort({ nombre: 1 }),
    Regla.find(),
    Venta.aggregate<{ _id: Types.ObjectId; total: number; cantidad: number }>([
      { $match: { fecha: { $gte: inicio, $lte: fin } } },
      { $group: { _id: "$vendedorId", total: { $sum: "$monto" }, cantidad: { $sum: 1 } } },
    ]),
  ]);

  const porVendedor = new Map(totales.map((t) => [String(t._id), t]));

  const filas = vendedores.map((vendedor) => {
    const t = porVendedor.get(String(vendedor._id));
    const totalVentas = round2(t?.total ?? 0);
    const { porcentaje, comision } = calcularComision(totalVentas, reglas);
    return {
      vendedorId: String(vendedor._id),
      nombre: vendedor.nombre,
      cantidadVentas: t?.cantidad ?? 0,
      totalVentas,
      porcentaje,
      comision,
    };
  });

  return {
    fechaInicio: String(fechaInicio),
    fechaFin: String(fechaFin),
    filas,
    totalVentas: round2(filas.reduce((suma, f) => suma + f.totalVentas, 0)),
    totalComisiones: round2(filas.reduce((suma, f) => suma + f.comision, 0)),
  };
}
