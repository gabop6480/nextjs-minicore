import { HttpError } from "./errors";

/** Convierte "YYYY-MM-DD" a Date (00:00 UTC). Rechaza formatos o fechas inexistentes (2025-02-31). */
export function parseDia(valor: unknown, etiqueta: string): Date {
  const texto = typeof valor === "string" ? valor.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw new HttpError(400, `${etiqueta}: usa el formato AAAA-MM-DD`);
  }
  const fecha = new Date(`${texto}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== texto) {
    throw new HttpError(400, `${etiqueta}: la fecha no existe`);
  }
  return fecha;
}

/** Rango inclusivo: desde las 00:00 del día inicio hasta las 23:59:59.999 del día fin. */
export function rangoDeFechas(inicioTxt: unknown, finTxt: unknown) {
  const inicio = parseDia(inicioTxt, "Fecha inicio");
  const finDia = parseDia(finTxt, "Fecha fin");
  if (finDia < inicio) {
    throw new HttpError(400, "La fecha fin no puede ser menor que la fecha inicio");
  }
  const fin = new Date(finDia.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { inicio, fin };
}
