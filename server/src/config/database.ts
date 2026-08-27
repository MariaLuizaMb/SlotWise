import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import * as schema from "../models/schema.js";

dotenv.config({ quiet: true });

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
