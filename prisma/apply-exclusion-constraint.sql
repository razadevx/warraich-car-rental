CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "no_overlapping_bookings";

ALTER TABLE "Booking"
ADD CONSTRAINT "no_overlapping_bookings"
EXCLUDE USING gist (
  "carId" WITH =,
  tsrange("pickupDateTime", "returnDateTime") WITH &&
)
WHERE ("status" IN ('PENDING', 'CONFIRMED', 'ACTIVE'));
