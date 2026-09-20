ALTER TYPE "AppointmentStatus" ADD VALUE 'PENDING';

CREATE UNIQUE INDEX "orders_appointment_id_key" ON "orders"("appointment_id");
