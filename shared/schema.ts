import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  followUpEnabled: boolean("follow_up_enabled").notNull().default(true),
  followUpSent: boolean("follow_up_sent").notNull().default(false),
});

// Schema for API input that accepts string dates
export const insertTaskApiSchema = z.object({
  title: z.string().min(1),
  scheduledTime: z.string().datetime().transform((val) => new Date(val)),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  followUpEnabled: z.boolean().default(true),
});

// Schema for database insert
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  completed: true,
  followUpSent: true,
});

export type InsertTaskApi = z.infer<typeof insertTaskApiSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
