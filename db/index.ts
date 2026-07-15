import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("Database is not configured");
    this.name = "DatabaseUnavailableError";
  }
}

type Database = ReturnType<typeof createDatabase>;

function createDatabase(connectionString: string) {
  const queryClient = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(queryClient, { schema });
}

const globalForDatabase = globalThis as typeof globalThis & {
  mishliDatabase?: Database;
};

/**
 * Lazily creates the server-only client so builds and the playable client do not
 * crash when DATABASE_URL has not been configured yet.
 */
export function getDb(): Database {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new DatabaseUnavailableError();
  }

  if (!globalForDatabase.mishliDatabase) {
    globalForDatabase.mishliDatabase = createDatabase(connectionString);
  }

  return globalForDatabase.mishliDatabase;
}
