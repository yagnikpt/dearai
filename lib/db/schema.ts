import { relations } from "drizzle-orm";
import {
	integer,
	json,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	age: integer().notNull(),
	gender: varchar({ length: 10 }).notNull(),
});

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid()
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: varchar({ length: 255 }).notNull(),
	contentHash: varchar({ length: 64 }).notNull().unique(),
	diarySavepointHash: varchar({ length: 64 }).notNull().unique(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const messageRoleEnum = pgEnum("role", ["user", "assistant", "system"]);
export const messageTypeEnum = pgEnum("type", ["text", "image"]);

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey(),
	conversationId: uuid()
		.notNull()
		.references(() => conversations.id, { onDelete: "cascade" }),
	role: messageRoleEnum().notNull(),
	type: messageTypeEnum().notNull().default("text"),
	content: text().notNull(),
	metadata: json(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const diaryEntry = pgTable("diary_entry", {
	id: uuid().defaultRandom().primaryKey(),
	conversationId: uuid()
		.notNull()
		.references(() => conversations.id, { onDelete: "cascade" }),
	date: timestamp().notNull(),
	summary: text().notNull(),
	createdAt: timestamp().defaultNow(),
	score: integer().notNull().default(0),
	updatedAt: timestamp().defaultNow(),
});

export const conversationsToDiary = pgTable(
	"conversations_to_diary",
	{
		conversationId: uuid()
			.notNull()
			.references(() => conversations.id, { onDelete: "cascade" }),
		diaryEntryId: uuid()
			.notNull()
			.references(() => diaryEntry.id, { onDelete: "cascade" }),
	},
	(t) => [primaryKey({ columns: [t.conversationId, t.diaryEntryId] })],
);

// RELATIONS

export const userRelations = relations(users, ({ many }) => ({
	conversations: many(conversations),
}));

export const conversationRelations = relations(
	conversations,
	({ one, many }) => ({
		user: one(users, {
			fields: [conversations.userId],
			references: [users.id],
		}),
		messages: many(messages),
	}),
);

export const messageRelations = relations(messages, ({ one }) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id],
	}),
}));

export const conversationsToDiaryRelations = relations(
	conversationsToDiary,
	({ one }) => ({
		diaryEntry: one(diaryEntry, {
			fields: [conversationsToDiary.diaryEntryId],
			references: [diaryEntry.id],
		}),
		conversation: one(conversations, {
			fields: [conversationsToDiary.conversationId],
			references: [conversations.id],
		}),
	}),
);
