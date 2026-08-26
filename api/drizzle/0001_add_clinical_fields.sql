ALTER TABLE "clinical_encounters" ADD COLUMN "reason_for_visit" jsonb;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD COLUMN "symptomatic_history" jsonb;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD COLUMN "medication_history" jsonb;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD COLUMN "family_ocular_history" jsonb;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD COLUMN "family_systemic_history" jsonb;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD COLUMN "spectacles_history" jsonb;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD COLUMN "contact_lens_history" jsonb;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD COLUMN "lifestyle_demands" jsonb;