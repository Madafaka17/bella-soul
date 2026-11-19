# bella.soul2024 — tienda en Next.js

Tienda de ropa femenina (Sorito, Moyobamba, San Martín) con panel administrativo.
Next.js (App Router) + MySQL / TiDB Cloud. Se despliega en Vercel sin configuración especial.

## Requisitos

- **Node.js 20 o superior** (`node -v`). En Windows: `winget install OpenJS.NodeJS.LTS`.
- Una base MySQL (local con XAMPP) o **TiDB Cloud**.

## Puesta en marcha en tu PC

```bash
npm install
copy .env.example .env.local      # y completa los datos de la base
npm run db:setup                  # crea las tablas y carga los 19 productos (solo si la base está vacía)
npm run dev                       # http://localhost:3000
```

- Tienda: <http://localhost:3000>
- Panel: <http://localhost:3000/admin/login> — usuario `admin@bellasoul.com`, contraseña inicial `password`.
  **Cámbiala** en *Admin → Configuración → Cambiar mi contraseña*.

## Variables de entorno

| Variable | Para qué |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Conexión a la base. Con TiDB Cloud el puerto es `4000`; la conexión usa TLS sola cuando el host no es local. |
| `SESSION_SECRET` | Cadena larga y secreta que firma las sesiones. Si falta se usa `APP_KEY`. **Obligatoria en producción.** |
| `STORE_NAME`, `WHATSAPP_NUMBER`, `MONEDA` | Opcionales (valores por defecto en `.env.example`). El WhatsApp y las tarifas también se editan desde el admin. |

## Despliegue en Vercel

1. Importa el repositorio y en **Root Directory** elige `bella-soul-next` (Framework: Next.js).
2. Agrega las variables de la tabla anterior (Production).
3. Crea las tablas y los datos en TiDB una sola vez desde tu PC: pon los datos de TiDB en `.env.local` y ejecuta `npm run db:setup`.
4. *Deploy*.

## Cómo funciona

- **Carrito**: cookie `bs_cart` con producto/talla/color/cantidad. Los precios salen siempre de la base de datos.
- **Envío**: `src/lib/tienda.js`. Moyobamba y alrededores → tarifa local; resto del país → tarifa nacional; gratis desde el mínimo configurado; recojo en tienda sin costo. Las tarifas se editan en *Admin → Configuración*.
- **Sesiones**: cookies firmadas (JWT) `bs_admin` y `bs_client`.
- **Fotos subidas desde el admin**: se guardan en la tabla `imagenes` y se sirven en `/media/<nombre>`. Las fotos del catálogo inicial están en `public/assets/img`.
- **Seguridad**: los POST comprueban el origen (CSRF), las contraseñas usan bcrypt y las boletas/confirmaciones solo las ve quien hizo el pedido o el admin.

## Estructura

```
src/app/(site)    tienda (inicio, catálogo, producto, carrito, pago, cuenta...)
src/app/(panel)   panel administrativo (exige sesión de admin)
src/app/(bare)    boleta imprimible y login del admin
src/app/api       endpoints POST (pago, login, registro, admin...)
src/lib           base de datos, sesión, carrito, envío, utilidades
db/               schema.sql y seed.sql
public/assets     CSS, JS y fotos
```
