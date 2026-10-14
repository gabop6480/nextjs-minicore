# MiniCore · Comisiones de ventas (Next.js + MongoDB, MVC)

Video: https://youtu.be/73bw5RXomqw
Github: https://github.com/gabop6480/nextjs-minicore
Deploy: https://nextjs-minicore.vercel.app/

Mini proyecto de una sola pantalla que filtra ventas por rango de fechas y calcula la comisión de cada vendedor.

## Cómo se calcula

1. Se suman las ventas de cada vendedor dentro del rango (ambos días incluidos).
2. Se aplica la regla con el **monto mínimo más alto que no supere ese total**.
3. `comisión = total vendido × porcentaje / 100`. Si ninguna regla aplica: 0 %.

Con los datos de ejemplo (01/06/2025 – 30/06/2025):

| Vendedor | Total | Regla | Comisión |
|---|---|---|---|
| Pedro Cadenas | $580.00 | 6 % | $34.80 |
| Maria Jimenez | $920.00 | 10 % | $92.00 |
| Juan Castro | $1,045.00 | 15 % | $156.75 |
| Luis Perez | $570.00 | 6 % | $34.20 |

Reglas de ejemplo: desde $500 → 6 %, $600 → 8 %, $800 → 10 %, $1,000 → 15 %.

## Arquitectura MVC

| Capa | Archivos |
|---|---|
| Modelo | `models/Vendedor.ts`, `Venta.ts`, `Regla.ts` |
| Controlador | `controllers/comisionController.ts`, `ventaController.ts`, `vendedorController.ts`, `reglaController.ts`, `datosController.ts` |
| Vista | `app/page.tsx` + `components/MiniCoreView.tsx` |
| Rutas (capa delgada) | `app/api/**/route.ts` |
| Lógica pura | `lib/comisiones.ts` (regla y cálculo), `lib/fechas.ts` (rango de fechas) |



