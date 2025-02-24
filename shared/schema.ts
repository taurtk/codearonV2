import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export type Problem = typeof problems.$inferSelect;
