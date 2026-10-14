# MiniCore · Comisiones de ventas (Next.js + MongoDB, MVC)

Réplica en Next.js y MongoDB del ejercicio "MiniCore" (versiones en Flask y Tornado):
una sola pantalla que filtra ventas por rango de fechas y calcula la comisión de cada vendedor.
Igual que el sistema de referencia, **no tiene login**.

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

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/comisiones?fecha_inicio=AAAA-MM-DD&fecha_fin=AAAA-MM-DD` | Comisiones por vendedor |
| GET | `/api/ventas?fecha_inicio=...&fecha_fin=...` | Ventas del rango |
| POST | `/api/ventas` | Agregar venta `{ vendedorId, fecha, monto }` |
| GET | `/api/vendedores` | Listar vendedores |
| GET | `/api/reglas` | Listar reglas |
| POST | `/api/datos/cargar` | Cargar el ejemplo (solo si la base está vacía) |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # y pega tu MONGODB_URI
npm run dev
```

Abre `http://localhost:3000` y pulsa **Cargar datos de ejemplo**.

## Cambiar las reglas

Como en el sistema original (que las edita en `data.sql`), las reglas no tienen pantalla de edición.
Para cambiarlas, modifica la lista `REGLAS` en `controllers/datosController.ts`, o edita la colección
`reglas` directamente en MongoDB Atlas.
