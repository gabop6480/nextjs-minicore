import dbConnect from "@/lib/mongodb";
import { HttpError } from "@/lib/errors";
import Regla from "@/models/Regla";
import Vendedor from "@/models/Vendedor";
import Venta from "@/models/Venta";

const REGLAS = [
  { montoMinimo: 500, porcentaje: 6 },
  { montoMinimo: 600, porcentaje: 8 },
  { montoMinimo: 800, porcentaje: 10 },
  { montoMinimo: 1000, porcentaje: 15 },
];

// Resultado esperado en junio de 2025:
// Pedro 580 -> 6% = 34.80 | María 920 -> 10% = 92.00 | Juan 1045 -> 15% = 156.75 | Luis 570 -> 6% = 34.20
const VENTAS: Record<string, [string, number][]> = {
  "Pedro Cadenas": [["2025-06-03", 50], ["2025-06-10", 30], ["2025-06-24", 500]],
  "Maria Jimenez": [["2025-06-05", 100], ["2025-06-12", 70], ["2025-06-26", 750]],
  "Juan Castro": [["2025-06-07", 90], ["2025-06-15", 5], ["2025-06-28", 950]],
  "Luis Perez": [["2025-06-09", 300], ["2025-06-21", 270]],
};

/** Carga datos de ejemplo. Solo si no hay vendedores, ventas ni reglas, para no mezclar datos reales. */
export async function cargarDatosEjemplo() {
  await dbConnect();

  const [v, s, r] = await Promise.all([
    Vendedor.estimatedDocumentCount(),
    Venta.estimatedDocumentCount(),
    Regla.estimatedDocumentCount(),
  ]);
  if (v + s + r > 0) {
    throw new HttpError(409, "La base ya tiene datos. Elimínalos antes de cargar el ejemplo.");
  }

  await Regla.insertMany(REGLAS);
  const vendedores = await Vendedor.insertMany(Object.keys(VENTAS).map((nombre) => ({ nombre })));

  const ventas = vendedores.flatMap((vendedor) =>
    VENTAS[vendedor.nombre].map(([dia, monto]) => ({
      vendedorId: vendedor._id,
      fecha: new Date(`${dia}T00:00:00.000Z`),
      monto,
    }))
  );
  await Venta.insertMany(ventas);

  return {
    vendedores: vendedores.length,
    ventas: ventas.length,
    reglas: REGLAS.length,
    fechaInicio: "2025-06-01",
    fechaFin: "2025-06-30",
  };
}
