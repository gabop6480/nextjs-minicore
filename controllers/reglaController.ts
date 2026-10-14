import dbConnect from "@/lib/mongodb";
import Regla from "@/models/Regla";

export async function listReglas() {
  await dbConnect();
  return Regla.find().sort({ montoMinimo: 1 });
}
