import sql, { config as SqlConfig } from 'mssql';

const sqlConfig: SqlConfig = {
  server: process.env.SQL_HOST || 'localhost',
  port: Number(process.env.SQL_PORT || 1435),
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE || 'FleetNew',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getDb() {
  if (!pool) {
    pool = await sql.connect(sqlConfig);
  }
  return pool;
}
