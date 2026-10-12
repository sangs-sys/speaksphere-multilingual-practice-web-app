import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from './config';

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(sql);
}
