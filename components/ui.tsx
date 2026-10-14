export const money = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);

/** "2025-06-05T00:00:00.000Z" -> "2025-06-05" (sin desfase por zona horaria) */
export const dia = (iso: string) => iso.slice(0, 10);

export function ErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="alert" role="alert">
      {message}
    </p>
  );
}
