ALTER TABLE "appointments" ADD COLUMN "doctor_user_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "start_time" varchar(10);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "end_time" varchar(10);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "reason" varchar(255);--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_user_id_users_id_fk" FOREIGN KEY ("doctor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;