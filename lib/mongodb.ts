import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Falta la variable de entorno MONGODB_URI en .env.local");
}

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: Cache;
};

const cached: Cache = (globalWithMongoose._mongooseCache ??= {
  conn: null,
  promise: null,
});

/** Conecta a MongoDB reutilizando la conexión entre recargas de desarrollo. */
export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string).catch((error) => {
      cached.promise = null; // permite reintentar si la conexión falló
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
