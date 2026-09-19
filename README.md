# SILHO – Medicina Estética

Fundación de la plataforma comercial de SILHO, Medicina Estética (Dr. Edwin Ayala), Ecuador.

## Desarrollo local

1. Copia `.env.example` a `.env` y completa las variables necesarias.
2. Levanta PostgreSQL: `docker compose up -d`.
3. Ejecuta `npm run db:migrate` y `npm run db:seed`.
4. Inicia Next.js: `npm run dev`.

La base local usa PostgreSQL 16 en el puerto `5433`. Neon puede utilizarse en producción mediante `DATABASE_URL`.

## Comandos

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:reset`

## PayPhone

La integración queda preparada para las credenciales server-only de PayPhone. La URL de respuesta local es `/payphone/response` y el webhook recibe solicitudes en `/api/payments/payphone/webhook`.
