import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// First define the problem schema for validation
export const problemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  difficulty: z.string(),
  acceptance_rate: z.string().nullable(),
  solution_link: z.string().nullable(),
  companies: z.array(z.string()).nullable(),
  related_topics: z.array(z.string()).nullable()
});

// Define the database table
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  acceptance_rate: text("acceptance_rate"),
  solution_link: text("solution_link"),
  companies: text("companies").array(),
  related_topics: text("related_topics").array(),
});

// Export types
export type Problem = z.infer<typeof problemSchema>;
export type ProblemSelect = typeof problems.$inferSelect;