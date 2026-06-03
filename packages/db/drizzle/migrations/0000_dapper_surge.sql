CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "extinguisher";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "inspection";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "notification";
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_by" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "extinguisher"."fire_extinguishers" (
	"id" serial PRIMARY KEY NOT NULL,
	"serial_number" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" varchar(20) NOT NULL,
	"building" varchar(100) NOT NULL,
	"floor" varchar(20) NOT NULL,
	"room" varchar(50) NOT NULL,
	"manufacture_date" date NOT NULL,
	"installation_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"status" varchar(30) DEFAULT 'Active' NOT NULL,
	"assigned_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_by" integer,
	CONSTRAINT "fire_extinguishers_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "inspection"."inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"extinguisher_id" integer NOT NULL,
	"inspector_id" integer NOT NULL,
	"inspection_date" date NOT NULL,
	"inspection_time" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'Scheduled' NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "inspection"."maintenances" (
	"id" serial PRIMARY KEY NOT NULL,
	"extinguisher_id" integer NOT NULL,
	"inspector_id" integer NOT NULL,
	"maintenance_date" date NOT NULL,
	"action_taken" text NOT NULL,
	"issues_found" text,
	"recommendations" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "notification"."notification_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"extinguisher_id" integer,
	"notification_type" varchar(50) NOT NULL,
	"sent_date" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification"."notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'unread' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
