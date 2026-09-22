-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "location_id" TEXT,
ADD COLUMN     "patient_goal" TEXT,
ADD COLUMN     "preferred_date" TIMESTAMP(3),
ADD COLUMN     "preferred_slot" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "web_price" DECIMAL(10,2);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
