import mongoose, { Model, Schema, Types } from "mongoose";

export interface IVenta {
  vendedorId: Types.ObjectId;
  fecha: Date;
  monto: number;
}

const VentaSchema = new Schema<IVenta>(
  {
    vendedorId: { type: Schema.Types.ObjectId, ref: "Vendedor", required: true, index: true },
    fecha: { type: Date, required: [true, "La fecha es obligatoria"], index: true },
    monto: { type: Number, required: [true, "El monto es obligatorio"], min: [0.01, "El monto debe ser mayor que 0"] },
  },
  { timestamps: true }
);

const Venta: Model<IVenta> =
  (mongoose.models.Venta as Model<IVenta>) || mongoose.model<IVenta>("Venta", VentaSchema);

export default Venta;
