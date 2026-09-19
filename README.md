# SILHO – Medicina Estética

SILHO es una plataforma comercial para medicina estética facial, capilar y de cabeza y cuello, creada para la consulta del Dr. Edwin Ayala en Ecuador. Incluye sitio público en español, catálogo de tratamientos, agenda, checkout, contenidos, leads y un panel administrativo preparado para crecer hacia CRM, membresías, pagos y seguimiento estético.

El contenido médico comunica posibilidades de mejora y valoración personalizada; no ofrece diagnósticos automáticos, resultados garantizados ni promesas de “100% eliminación”.

## Stack

- Next.js 16 App Router, TypeScript y React 19.
- Tailwind CSS 4 y componentes Base UI/shadcn.
- Prisma 7 con PostgreSQL 16.
- Zod y React Hook Form.
- Vitest, `jose`, `bcryptjs`, PayPhone, `marked` y `sanitize-html`.

## Estructura del repositorio

```text
.
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/                 # Sitio público, API y panel /admin
│   ├── components/          # Componentes de sitio y UI
│   └── lib/                 # Prisma, auth, pagos, precios y validación
├── docker-compose.yml
├── next.config.ts
├── prisma.config.ts
├── proxy.ts
└── package.json
```

## Modelo de datos

| Modelo | Descripción |
|---|---|
| `Setting` | Configuración editable por clave, como descuento, redes y contacto. |
| `Category` | Categorías públicas de tratamientos y su orden. |
| `Service` | Tratamiento, precio, duración, flags comerciales y preocupaciones. |
| `Concern` | Preocupación estética relacionada con servicios. |
| `ServiceConcern` | Tabla puente entre servicios y preocupaciones. |
| `Location` | Sede, ciudad, dirección, teléfono, mapa, estado y orden. |
| `Professional` | Perfil del profesional y contenido estructurado. |
| `Patient` | Datos de contacto y documento del paciente. |
| `Lead` | Contacto comercial, origen, estado y notas. |
| `Appointment` | Solicitud de cita con paciente, servicio, sede y profesional. |
| `Order` | Compra, precios, descuento, método y estado. |
| `Payment` | Intento de pago y respuesta del proveedor. |
| `SubscriptionPlan` | Plan de membresía, precio e intervalo. |
| `Subscription` | Suscripción de un paciente y su estado. |
| `BeforeAfter` | Caso antes/después con consentimiento e imágenes. |
| `BlogPost` | Artículo Markdown, categoría, publicación y portada. |
| `AdminUser` | Usuario administrativo, hash de contraseña y rol. |

## Ejecución local

Requisitos: Node.js 20+, npm, Docker y Docker Compose.

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

El sitio queda en `http://localhost:3000` y el panel en `http://localhost:3000/admin/login`. El seed usa `ADMIN_EMAIL` y `ADMIN_PASSWORD`; por defecto son `admin@silho.ec` y `change-me-please`, valores que deben cambiarse fuera de desarrollo.

## Scripts npm

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Compilación de producción. |
| `npm run start` | Servidor de producción. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript sin emitir archivos. |
| `npm test` | Suite Vitest. |
| `npm run db:generate` | Genera Prisma Client. |
| `npm run db:migrate` | Migraciones de desarrollo. |
| `npx prisma migrate deploy` | Aplica migraciones existentes en producción. |
| `npm run db:seed` | Seed idempotente. |
| `npm run db:reset` | Migrate reset sin seed automático y seed explícito. |

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión PostgreSQL local o Neon. |
| `ADMIN_EMAIL` | Correo del administrador creado por el seed. |
| `ADMIN_PASSWORD` | Contraseña inicial del administrador. |
| `AUTH_SECRET` | Secreto largo para firmar la sesión JWT. |
| `NEXT_PUBLIC_APP_URL` | URL pública para enlaces y PayPhone. |
| `PAYPHONE_TOKEN` | Token server-only de PayPhone. |
| `PAYPHONE_STORE_ID` | Identificador de tienda PayPhone. |
| `PAYPHONE_CLIENT_ID` | Client ID de PayPhone. |
| `PAYPHONE_CLIENT_SECRET` | Client secret server-only de PayPhone. |
| `PAYPHONE_ENVIRONMENT` | `sandbox` o producción. |
| `RESEND_API_KEY` | API key opcional para correo transaccional. |

La configuración operativa (`PRONTO_PAGO_DISCOUNT`, WhatsApp, redes, correo, transferencia y precios quirúrgicos) se administra desde `Configuración` y se almacena en `Setting`.

## Despliegue en Vercel + Neon

1. Crea una base PostgreSQL en Neon y copia su `DATABASE_URL`.
2. Configura en Vercel las variables de `.env.example` con valores de producción.
3. Usa este Build Command:

   ```bash
   prisma generate && prisma migrate deploy && next build
   ```

4. Despliega, conecta el dominio personalizado y actualiza `NEXT_PUBLIC_APP_URL` a `https://<dominio>`.
5. Ejecuta el seed de producción de forma controlada y cambia las credenciales de desarrollo.

No se necesita `vercel.json`; el Build Command se configura directamente en Vercel.

## PayPhone

Para conectarlo en producción faltan la cuenta comercial, credenciales/token, Store ID, activación del botón de pagos, pruebas sandbox y registro del dominio HTTPS.

URL de respuesta:

```text
https://<dominio>/payphone/response
```

Webhook:

```text
/api/payments/payphone/webhook
```

Flujo:

```text
create → redirect → response → confirm
```

El proveedor no hace llamadas de red si falta `PAYPHONE_TOKEN`; la orden permanece pendiente para contacto manual.

## Checklist antes de producción

- [ ] Textos legales revisados por abogado.
- [ ] Datos reales y autorizados del Dr. Edwin Ayala.
- [ ] Fotos reales con consentimiento.
- [ ] Resend y correo transaccional configurados.
- [ ] Dominios, HTTPS y metadata revisados.
- [ ] Backups de Neon configurados.
- [ ] `ADMIN_PASSWORD` y `AUTH_SECRET` cambiados.
- [ ] Rate limiting distribuido en lugar del limitador en memoria.
- [ ] Imágenes reales optimizadas.
- [ ] Google Search Console configurado.
- [ ] PayPhone verificado en sandbox y producción.

`.env*`, `.next/`, logs y `.screenshots/` están cubiertos por `.gitignore`; nunca subas credenciales ni secretos.
