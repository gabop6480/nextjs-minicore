import mongoose, { Model, Schema } from "mongoose";

export interface IVendedor {
  nombre: string;
  email?: string;
}

const VendedorSchema = new Schema<IVendedor>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [100, "El nombre admite máximo 100 caracteres"],
    },
    email: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true }
);

const Vendedor: Model<IVendedor> =
  (mongoose.models.Vendedor as Model<IVendedor>) ||
  mongoose.model<IVendedor>("Vendedor", VendedorSchema);

export default Vendedor;
