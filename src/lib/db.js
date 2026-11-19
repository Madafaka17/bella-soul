import mysql from 'mysql2/promise';

/**
 * Conexión a MySQL / TiDB Cloud.
 * - En local (host 127.0.0.1 / localhost) no se usa TLS.
 * - Con cualquier otro host (TiDB Cloud) se activa TLS 1.2+ con validación del certificado.
 * - Las fechas se devuelven como texto ("YYYY-MM-DD HH:MM:SS") en hora de Lima.
 */
const TZ = '-05:00';

function crearPool() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const local = host === '127.0.0.1' || host === 'localhost';

  const pool = mysql.createPool({
    host,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'tienda_ropa_mujer',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 5,
    idleTimeout: 20000,
    enableKeepAlive: true,
    decimalNumbers: true,
    dateStrings: true,
    ssl: local ? undefined : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  });

  // Todas las conexiones trabajan en hora de Lima (NOW(), CURDATE(), etc.)
  pool.pool.on('connection', (conn) => {
    conn.query(`SET time_zone = '${TZ}'`);
  });

  return pool;
}

// Reutiliza el pool entre recargas en desarrollo y entre invocaciones calientes en Vercel
const g = globalThis;
export const pool = (g.__bellaPool ??= crearPool());

/** Devuelve todas las filas */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Devuelve la primera fila (o null) */
export async function one(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

/** Ejecuta INSERT/UPDATE/DELETE y devuelve { insertId, affectedRows } */
export async function exec(sql, params = []) {
  const [res] = await pool.query(sql, params);
  return res;
}

/** Ejecuta varias operaciones en una transacción */
export async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn({
      query: async (sql, params = []) => (await conn.query(sql, params))[0],
      exec: async (sql, params = []) => (await conn.query(sql, params))[0],
    });
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
