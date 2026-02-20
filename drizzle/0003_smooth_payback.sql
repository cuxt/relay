CREATE TABLE "ai_presets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"provider_id" text NOT NULL,
	"model" text NOT NULL,
	"system_prompt" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"base_url" text NOT NULL,
	"api_key" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "endpoints" ADD COLUMN "ai_preset_id" text;--> statement-breakpoint
ALTER TABLE "push_logs" ADD COLUMN "ai_preset_id" text;--> statement-breakpoint
ALTER TABLE "push_logs" ADD COLUMN "ai_processed_message" text;--> statement-breakpoint
ALTER TABLE "push_logs" ADD COLUMN "ai_latency_ms" integer;--> statement-breakpoint
ALTER TABLE "push_logs" ADD COLUMN "ai_error" text;--> statement-breakpoint
ALTER TABLE "ai_presets" ADD CONSTRAINT "ai_presets_provider_id_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_presets" ADD CONSTRAINT "ai_presets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_providers" ADD CONSTRAINT "ai_providers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_presets_user_id_idx" ON "ai_presets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_presets_provider_id_idx" ON "ai_presets" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "ai_providers_user_id_idx" ON "ai_providers" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_ai_preset_id_ai_presets_id_fk" FOREIGN KEY ("ai_preset_id") REFERENCES "public"."ai_presets"("id") ON DELETE set null ON UPDATE no action;