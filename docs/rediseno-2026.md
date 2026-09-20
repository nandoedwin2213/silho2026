# Rediseño SILHO 2026

## Arquitectura

SILHO es una clínica facial premium con un sitio público en Next.js App Router, PostgreSQL mediante Prisma, autenticación administrativa y sesiones JWT independientes para pacientes. El catálogo, las sedes, los contenidos, los puntos, las recompensas, las citas y las órdenes se administran desde el mismo modelo de datos. Los montos de checkout y reservas se recalculan en el servidor antes de escribir una orden.

La reserva facial usa `/reservar`: ruta facial, sede, fecha, hora, datos básicos, antecedentes esenciales, beneficios/puntos y pago. Las citas usan `America/Guayaquil`; PayPhone aplica el beneficio web y CASH/TRANSFER permanecen pendientes al precio regular. Las comunicaciones pasan por `src/lib/notifications.ts`.

## Catálogo facial activo

El seed conserva categorías y servicios históricos para recuperación, pero desactiva las categorías no faciales, sus servicios y los contenidos capilares o quirúrgicos que ya no representan el posicionamiento público. La restauración del catálogo puede hacerse en una rama o entorno controlado con `active: true`, revisando también la publicación de contenidos antes de exponerlos.

## Configuración

Las claves editables incluyen `WEB_ASSESSMENT_DISCOUNT`, `WEB_TREATMENT_BONUS_USD`, `WEB_BONUS_DAYS`, `WEB_OFFER_VALID_UNTIL`, `REWARDS_POINTS_PER_USD`, `REWARDS_POINT_VALUE_USD`, `REWARDS_MAX_REDEEM_PERCENT`, `REWARDS_EXPIRY_MONTHS` y `CLINIC_HOURS`. También se conservan las claves de contacto, transferencia, redes y compatibilidad del catálogo anterior.

## Variables nuevas

- `NEXT_PUBLIC_GA_ID`: medición GA4 opcional.
- `CRON_SECRET`: secreto para autorizar la expiración semanal de puntos.
- `RESEND_API_KEY`: API opcional de Resend.
- `EMAIL_FROM`: remitente usado por Resend junto con `RESEND_API_KEY`.

Sin las dos variables de Resend, las notificaciones se registran con `console.info` y no interrumpen reservas ni tareas cron.

## Backup y restauración

Antes de una migración o despliegue:

```bash
npm run db:backup
npx prisma migrate deploy
npm run db:seed
```

El backup exporta categorías, servicios, relaciones de preocupaciones, preocupaciones, settings y artículos a `backups/catalog-<ISO>.json`. La carpeta está ignorada por Git. Para restaurar catálogo, revisar el JSON y ejecutar una importación controlada en una base local, usando `active: true` únicamente para categorías y servicios aprobados; después verificar rutas, precios, sedes y contenidos antes de publicar.

## Despliegue y verificación

1. Crear un backup local del catálogo y confirmar variables de entorno.
2. Ejecutar `npx prisma migrate deploy`.
3. Ejecutar el seed idempotente en el entorno elegido.
4. Confirmar `AUTH_SECRET`, `CRON_SECRET`, PayPhone y correo.
5. Verificar registro e ingreso de paciente, disponibilidad, reserva CASH y reserva PayPhone.
6. Confirmar una página de gracias, puntos y acceso aislado en `/cuenta`.
7. Confirmar el cron `/api/cron/points-expiry` con `Authorization: Bearer $CRON_SECRET`.
