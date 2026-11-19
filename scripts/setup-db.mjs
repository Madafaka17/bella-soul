// Crea las tablas y carga los datos iniciales (admin, categorías, productos, ajustes).
//
//   npm run db:setup
//
// Usa las variables DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME y DB_PASSWORD
// (del entorno o del archivo .env / .env.local). Es seguro ejecutarlo varias veces:
// las tablas se crean solo si no existen y los datos iniciales solo si la base está vacía.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import mysql from 'mysql2/promise';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

// Lector mínimo de archivos .env
for (const archivo of ['.env.local', '.env']) {
  const ruta = join(raiz, archivo);
  if (!existsSync(ruta)) continue;
  for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const host = process.env.DB_HOST || '127.0.0.1';
const local = host === '127.0.0.1' || host === 'localhost';
const base = process.env.DB_DATABASE || 'tienda_ropa_mujer';

console.log(`Conectando a ${host}:${process.env.DB_PORT || 3306} (base "${base}")...`);

// Se conecta primero sin base para poder crearla si no existe
const opciones = {
  host,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4',
  multipleStatements: true,
  ssl: local ? undefined : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
};

let conn;
try {
  conn = await mysql.createConnection(opciones);
} catch (e) {
  console.error(`\nNo se pudo conectar: ${e.message}`);
  process.exit(1);
}

try {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${base}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${base}\``);

  await conn.query(readFileSync(join(raiz, 'db', 'schema.sql'), 'utf8'));
  console.log('✔ Tablas listas.');

  const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM categorias');
  if (n === 0) {
    await conn.query(readFileSync(join(raiz, 'db', 'seed.sql'), 'utf8'));
    console.log('✔ Datos iniciales cargados.');
  } else {
    console.log('• La base ya tiene datos: no se cargaron los datos iniciales.');
  }

  for (const t of ['categorias', 'productos', 'administradores', 'configuracion', 'pedidos']) {
    const [[{ c }]] = await conn.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
    console.log(`  ${t.padEnd(16)} ${c}`);
  }
  console.log('\nListo.');
} catch (e) {
  console.error(`\nError: ${e.message}`);
  process.exitCode = 1;
} finally {
  await conn.end();
}
