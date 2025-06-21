import { conversations, messages } from "@/lib/db/schema";

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
