CREATE TABLE "investments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"symbol" text,
	"type" text NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"purchase_price" numeric(12, 2) NOT NULL,
	"current_price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"purchase_date" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
