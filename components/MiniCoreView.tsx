"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errorMessage, hoy, inicioDeMes } from "@/lib/client";
import { ErrorAlert, dia, money } from "@/components/ui";

interface Fila {
  vendedorId: string;
  nombre: string;
  cantidadVentas: number;
  totalVentas: number;
  porcentaje: number;
  comision: number;
}
interface Resultado {
  filas: Fila[];
  totalVentas: number;
  totalComisiones: number;
}
interface Vendedor {
  _id: string;
  nombre: string;
}
interface Regla {
  _id: string;
  montoMinimo: number;
  porcentaje: number;
}
interface Venta {
  _id: string;
  vendedorId: { _id: string; nombre: string } | null;
  fecha: string;
  monto: number;
}

export default function MiniCoreView() {
  // Filtro
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");

  // Datos
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [reglas, setReglas] = useState<Regla[]>([]);

  // Estado de la interfaz
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Formulario "Agregar venta"
  const [form, setForm] = useState({ vendedorId: "", fecha: "", monto: "" });

  const cargarCatalogos = useCallback(async () => {
    const [v, r] = await Promise.all([
      api<Vendedor[]>("/api/vendedores"),
      api<Regla[]>("/api/reglas"),
    ]);
    setVendedores(v);
    setReglas(r);
  }, []);

  const consultar = useCallback(async (desde: string, hasta: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ fecha_inicio: desde, fecha_fin: hasta }).toString();
      const [comisiones, lista] = await Promise.all([
        api<Resultado>(`/api/comisiones?${query}`),
        api<Venta[]>(`/api/ventas?${query}`),
      ]);
      setResultado(comisiones);
      setVentas(lista);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Al abrir: rango del primer día del mes a hoy
  useEffect(() => {
    const desde = inicioDeMes();
    const hasta = hoy();
    setInicio(desde);
    setFin(hasta);
    setForm((f) => ({ ...f, fecha: hasta }));
    cargarCatalogos().catch((e) => setError(errorMessage(e)));
    consultar(desde, hasta);
  }, [cargarCatalogos, consultar]);

  const onFiltrar = (e: FormEvent) => {
    e.preventDefault();
    setAviso(null);
    consultar(inicio, fin);
  };

  const onCargarEjemplo = async () => {
    setSeeding(true);
    setError(null);
    try {
      const r = await api<{ fechaInicio: string; fechaFin: string }>("/api/datos/cargar", {
        method: "POST",
      });
      setInicio(r.fechaInicio);
      setFin(r.fechaFin);
      await cargarCatalogos();
      await consultar(r.fechaInicio, r.fechaFin);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSeeding(false);
    }
  };

  const onAgregarVenta = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setAviso(null);
    try {
      await api("/api/ventas", { method: "POST", body: form });
      setForm({ vendedorId: form.vendedorId, fecha: form.fecha, monto: "" });
      const fueraDeRango = form.fecha < inicio || form.fecha > fin;
      await consultar(inicio, fin);
      setAviso(
        fueraDeRango
          ? "Venta registrada. Su fecha queda fuera del rango filtrado, por eso no aparece abajo."
          : "Venta registrada."
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const sinDatos = resultado !== null && resultado.filas.length === 0;

  return (
    <main className="container">
      <header>
        <h1 className="page-title">MiniCore · Comisiones de ventas</h1>
        <p className="lead">
          Elige un rango de fechas para ver el total vendido por cada vendedor y la comisión que le
          corresponde según las reglas.
        </p>
      </header>

      <section className="panel">
        <form onSubmit={onFiltrar} className="filters">
          <div className="field">
            <label htmlFor="inicio">Desde</label>
            <input
              id="inicio"
              type="date"
              className="input"
              value={inicio}
              max={fin || undefined}
              onChange={(e) => setInicio(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="fin">Hasta</label>
            <input
              id="fin"
              type="date"
              className="input"
              value={fin}
              min={inicio || undefined}
              onChange={(e) => setFin(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Calculando…" : "Filtrar ventas"}
          </button>
        </form>
      </section>

      <ErrorAlert message={error} />
      {aviso && <p className="notice">{aviso}</p>}

      {sinDatos ? (
        <section className="panel">
          <h2>Todavía no hay datos</h2>
          <p className="empty">
            Carga el conjunto de ejemplo (4 vendedores, 4 reglas y ventas de junio de 2025) para ver
            el sistema funcionando.
          </p>
          <div className="form-actions" style={{ marginTop: "1rem" }}>
            <button className="btn btn-primary" onClick={onCargarEjemplo} disabled={seeding}>
              {seeding ? "Cargando…" : "Cargar datos de ejemplo"}
            </button>
          </div>
        </section>
      ) : resultado ? (
        <>
          <section className="stats">
            <div className="stat">
              <span className="stat-label">Total vendido</span>
              <span className="stat-value">{money(resultado.totalVentas)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total en comisiones</span>
              <span className="stat-value accent">{money(resultado.totalComisiones)}</span>
            </div>
          </section>

          <section className="panel">
            <h2>Comisión por vendedor</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vendedor</th>
                    <th className="num">Ventas</th>
                    <th className="num">Total vendido</th>
                    <th className="num">Comisión %</th>
                    <th className="num">Comisión</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.filas.map((f) => (
                    <tr key={f.vendedorId}>
                      <td>{f.nombre}</td>
                      <td className="num">{f.cantidadVentas}</td>
                      <td className="num">{money(f.totalVentas)}</td>
                      <td className="num">{f.porcentaje}%</td>
                      <td className="num commission">{money(f.comision)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>Total</td>
                    <td className="num">{money(resultado.totalVentas)}</td>
                    <td />
                    <td className="num commission">{money(resultado.totalComisiones)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>Ventas del periodo</h2>
            {ventas.length === 0 ? (
              <p className="empty">No hay ventas entre estas fechas.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Vendedor</th>
                      <th className="num">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((v) => (
                      <tr key={v._id}>
                        <td>{dia(v.fecha)}</td>
                        <td>{v.vendedorId?.nombre ?? "—"}</td>
                        <td className="num">{money(v.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Agregar venta</h2>
            <form onSubmit={onAgregarVenta}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="vendedor">Vendedor</label>
                  <select
                    id="vendedor"
                    className="input"
                    value={form.vendedorId}
                    onChange={(e) => setForm({ ...form, vendedorId: e.target.value })}
                    required
                  >
                    <option value="">Selecciona…</option>
                    {vendedores.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="fecha">Fecha</label>
                  <input
                    id="fecha"
                    type="date"
                    className="input"
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="monto">Monto (USD)</label>
                  <input
                    id="monto"
                    type="number"
                    className="input"
                    min="0.01"
                    step="0.01"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: "1rem" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Guardando…" : "Registrar venta"}
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <h2>Reglas de comisión</h2>
            <p className="empty" style={{ marginBottom: "0.75rem" }}>
              Se aplica la regla con el monto mínimo más alto que no supere el total vendido. Si
              ninguna aplica, la comisión es 0%.
            </p>
            {reglas.length === 0 ? (
              <p className="empty">No hay reglas cargadas.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="num">Desde (total vendido)</th>
                      <th className="num">Comisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reglas.map((r) => (
                      <tr key={r._id}>
                        <td className="num">{money(r.montoMinimo)}</td>
                        <td className="num">{r.porcentaje}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
