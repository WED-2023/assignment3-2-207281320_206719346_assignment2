-- Add image column to myrecipes table if it doesn't exist
ALTER TABLE myrecipes ADD COLUMN image VARCHAR(500);
