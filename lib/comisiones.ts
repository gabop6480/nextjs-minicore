export type ReglaLite = { montoMinimo: number; porcentaje: number };

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Regla con el monto mínimo MÁS ALTO que sea menor o igual al total. Si ninguna aplica, null. */
export function aplicarRegla(total: number, reglas: ReglaLite[]): ReglaLite | null {
  let mejor: ReglaLite | null = null;
  for (const regla of reglas) {
    if (regla.montoMinimo <= total && (!mejor || regla.montoMinimo > mejor.montoMinimo)) {
      mejor = regla;
    }
  }
  return mejor;
}

export function calcularComision(total: number, reglas: ReglaLite[]) {
  const regla = aplicarRegla(total, reglas);
  const porcentaje = regla?.porcentaje ?? 0;
  return { porcentaje, comision: round2((total * porcentaje) / 100) };
}
