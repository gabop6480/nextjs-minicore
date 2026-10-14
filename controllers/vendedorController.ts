import dbConnect from "@/lib/mongodb";
import Vendedor from "@/models/Vendedor";

export async function listVendedores() {
  await dbConnect();
  return Vendedor.find().sort({ nombre: 1 });
}
