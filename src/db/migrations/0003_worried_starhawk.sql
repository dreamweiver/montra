ALTER TABLE "recurring_transactions" ADD COLUMN "currency" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "currency" text DEFAULT 'INR' NOT NULL;