/** Utilidades para los componentes de cliente (vistas). */

export async function api<T>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    window.location.href = "/login"; // sesión caducada
    throw new Error("Tu sesión expiró. Inicia sesión de nuevo.");
  }

  const result = await res.json().catch(() => null);
  if (!result?.success) throw new Error(result?.error ?? "Respuesta inesperada del servidor");
  return result.data as T;
}

export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Ocurrió un error inesperado";

const pad = (n: number) => String(n).padStart(2, "0");

/** Fecha local de hoy como AAAA-MM-DD (sin desfase por zona horaria). */
export function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function inicioDeMes() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}
