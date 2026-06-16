import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const examples = pgTable("examples", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
