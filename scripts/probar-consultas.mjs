// Prueba las consultas principales de la tienda contra la base configurada en el entorno.
//   DB_DATABASE=bella_next_prueba node scripts/probar-consultas.mjs
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'tienda_ropa_mujer',
  decimalNumbers: true,
  dateStrings: true,
  ssl: ['127.0.0.1', 'localhost', undefined].includes(process.env.DB_HOST) ? undefined : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
});
await conn.query("SET time_zone = '-05:00'");
await conn.query("SET SESSION sql_mode = CONCAT(@@sql_mode, ',ONLY_FULL_GROUP_BY')");

const PRECIO = 'COALESCE(NULLIF(p.precio_oferta, 0), p.precio)';
const pruebas = {
  'catálogo (filtros + talla + color)': [
    `SELECT COUNT(*) AS total FROM productos p JOIN categorias c ON c.id = p.categoria_id
     WHERE p.estado = 1 AND c.slug = ? AND (p.nombre LIKE ? OR p.descripcion LIKE ?) AND p.stock > 0 AND ${PRECIO} <= ?
       AND EXISTS (SELECT 1 FROM producto_tallas t WHERE t.producto_id = p.id AND t.talla IN (?) AND t.stock > 0)
       AND EXISTS (SELECT 1 FROM producto_colores k WHERE k.producto_id = p.id AND k.color LIKE ?)`,
    ['vestidos-largos', '%a%', '%a%', 500, ['S', 'M'], '%r%'],
  ],
  'catálogo (orden por precio)': [
    `SELECT p.id, p.nombre FROM productos p JOIN categorias c ON c.id = p.categoria_id WHERE p.estado = 1
     ORDER BY ${PRECIO} ASC, p.id DESC LIMIT ? OFFSET ?`,
    [12, 0],
  ],
  'carrito (IN)': ['SELECT id, nombre, imagen, precio, precio_oferta, stock FROM productos WHERE estado = 1 AND id IN (?)', [[1, 2, 3]]],
  'dashboard (hoy)': ["SELECT COALESCE(SUM(total), 0) AS v FROM pedidos WHERE DATE(created_at) = CURDATE() AND estado <> 'cancelado'", []],
  'dashboard (7 días)': [
    `SELECT DATE(created_at) AS fecha, SUM(total) AS total FROM pedidos
     WHERE created_at >= (NOW() - INTERVAL 7 DAY) AND estado <> 'cancelado' GROUP BY DATE(created_at) ORDER BY fecha`,
    [],
  ],
  'ventas (mensuales)': [
    `SELECT YEAR(created_at) AS anio, MONTH(created_at) AS mes_num, SUM(total) AS total, COUNT(*) AS cantidad
     FROM pedidos WHERE estado <> 'cancelado' GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY anio DESC, mes_num DESC LIMIT 12`,
    [],
  ],
  'ventas (mes actual)': ["SELECT COALESCE(SUM(total), 0) AS v FROM pedidos WHERE DATE(created_at) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')", []],
  'ventas (top)': [
    `SELECT d.nombre_producto AS nombre, SUM(d.cantidad) AS total_vendido, SUM(d.subtotal) AS monto_total
     FROM detalle_pedido d JOIN pedidos p ON p.id = d.pedido_id WHERE p.estado <> 'cancelado'
     GROUP BY d.nombre_producto ORDER BY total_vendido DESC LIMIT 10`,
    [],
  ],
  'clientes': [
    `SELECT c.*, (SELECT COUNT(*) FROM pedidos p WHERE p.cliente_id = c.id AND p.estado <> 'cancelado') AS total_pedidos
     FROM clientes c ORDER BY c.created_at DESC LIMIT 20 OFFSET 0`,
    [],
  ],
  'pagos': ['SELECT g.*, p.numero_pedido FROM pagos g LEFT JOIN pedidos p ON p.id = g.pedido_id ORDER BY g.created_at DESC LIMIT 20', []],
  'configuración (upsert)': [
    `INSERT INTO configuracion (clave, valor, created_at, updated_at) VALUES ('__prueba', '1', NOW(), NOW())
     ON DUPLICATE KEY UPDATE valor = VALUES(valor), updated_at = NOW()`,
    [],
  ],
};

let fallos = 0;
for (const [nombre, [sql, params]] of Object.entries(pruebas)) {
  try {
    const [r] = await conn.query(sql, params);
    console.log(`✔ ${nombre.padEnd(36)} ${Array.isArray(r) ? r.length + ' filas' : 'ok'}`);
  } catch (e) {
    fallos++;
    console.log(`✘ ${nombre.padEnd(36)} ${e.message}`);
  }
}
await conn.query("DELETE FROM configuracion WHERE clave = '__prueba'");
await conn.end();
process.exit(fallos ? 1 : 0);
