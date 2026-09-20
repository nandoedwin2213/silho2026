CREATE UNIQUE INDEX "points_transactions_order_id_reason_patient_id_key"
ON "points_transactions"("order_id", "reason", "patient_id");
