ALTER TABLE "endpoints" DROP CONSTRAINT "endpoints_ai_preset_id_ai_presets_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_presets" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_presets_user_key_idx" ON "ai_presets" USING btree ("user_id","key");--> statement-breakpoint
ALTER TABLE "endpoints" DROP COLUMN "ai_preset_id";