CREATE UNIQUE INDEX "appointments_active_slot_key"
ON "appointments"("location_id", "date")
WHERE "status" <> 'CANCELLED';
