import mongoose, { Model, Schema } from "mongoose";

export interface IRegla {
  montoMinimo: number; // total de ventas a partir del cual aplica la regla
  porcentaje: number; // porcentaje de comisión (6 = 6%)
}

const ReglaSchema = new Schema<IRegla>(
  {
    montoMinimo: {
      type: Number,
      required: [true, "El monto mínimo es obligatorio"],
      min: [0, "El monto mínimo no puede ser negativo"],
      unique: true, // evita dos reglas con el mismo umbral (sería ambiguo)
    },
    porcentaje: {
      type: Number,
      required: [true, "El porcentaje es obligatorio"],
      min: [0, "El porcentaje no puede ser negativo"],
      max: [100, "El porcentaje no puede superar 100"],
    },
  },
  { timestamps: true }
);

const Regla: Model<IRegla> =
  (mongoose.models.Regla as Model<IRegla>) || mongoose.model<IRegla>("Regla", ReglaSchema);

export default Regla;
