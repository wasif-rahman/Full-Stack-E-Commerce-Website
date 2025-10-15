import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
//we use pg as a driver for postgres to connect our drizzle to postgressql database like we want to link drizzle to our database and pool is used to manage multiple connections to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Railway connections
});

const db = drizzle(pool);

export default db;

