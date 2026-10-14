import mongoose from "mongoose";
import { HttpError } from "@/lib/errors";

export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Acepta number o string numérico. Devuelve NaN si no es un número válido. */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

export function assertValidId(id: string, label = "ID") {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `${label} inválido`);
}

export function isDuplicateKey(error: unknown) {
  return (error as { code?: number })?.code === 11000;
}
