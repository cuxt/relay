CREATE TABLE "endpoint_channels" (
	"endpoint_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "endpoint_channels_endpoint_id_channel_id_pk" PRIMARY KEY("endpoint_id","channel_id")
);
--> statement-breakpoint
ALTER TABLE "endpoints" DROP CONSTRAINT "endpoints_channel_id_channels_id_fk";
--> statement-breakpoint
DROP INDEX "endpoints_channel_id_idx";--> statement-breakpoint
ALTER TABLE "endpoint_channels" ADD CONSTRAINT "endpoint_channels_endpoint_id_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endpoint_channels" ADD CONSTRAINT "endpoint_channels_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "endpoint_channels_channel_id_idx" ON "endpoint_channels" USING btree ("channel_id");--> statement-breakpoint
INSERT INTO "endpoint_channels" ("endpoint_id", "channel_id")
SELECT "id", "channel_id" FROM "endpoints";--> statement-breakpoint
ALTER TABLE "endpoints" DROP COLUMN "channel_id";
