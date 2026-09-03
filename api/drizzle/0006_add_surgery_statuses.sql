ALTER TYPE "public"."surgery_status" ADD VALUE IF NOT EXISTS 'CANCELLED';
--> statement-breakpoint
ALTER TYPE "public"."surgery_status" ADD VALUE IF NOT EXISTS 'RE-SCHEDULED';
