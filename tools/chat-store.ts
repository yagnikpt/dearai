import { generateAPIUrl } from "@/utils";
import * as Crypto from "expo-crypto";
import type * as SQLite from "expo-sqlite";
import { fetch } from "expo/fetch";

export async function createChat(
	db: SQLite.SQLiteDatabase,
	title: string,
	id?: string,
) {
	const columnid = id ?? Crypto.randomUUID();
	await db.runAsync(
		`
		INSERT INTO conversations (id, title)
		VALUES (?, ?)
	`,
		columnid,
		title,
	);
	return columnid;
}

export async function addMessage(
	db: SQLite.SQLiteDatabase,
	conversationId: string,
	message: string,
	sender: "user" | "assistant" | "system" | "data",
) {
	const id = Crypto.randomUUID();
	try {
		await db.runAsync(
			`
			INSERT INTO messages (id, conversation_id, content, role)
			VALUES (?, ?, ?, ?)
		`,
			id,
			conversationId,
			message,
			sender,
		);
		const msg = await db.getFirstAsync(
			`
			SELECT * FROM messages WHERE id = ?
		`,
			id,
		);
		return msg;
	} catch (error) {
		console.error("Error adding message:", error);
		throw error;
	}
}

export async function deleteChat(db: SQLite.SQLiteDatabase, id: string) {
	await db.runAsync(`DELETE FROM conversations WHERE id = ?`, id);
}

export async function generateTitle(
	db: SQLite.SQLiteDatabase,
	id: string,
	initial: string,
) {
	const res = await fetch(generateAPIUrl("/api/utility"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: initial,
			system_prompt: `
							You are a highly capable language model tasked with generating a concise chat title (5-10 words) that accurately summarizes the main topic or intent of a user's query message. Analyze the query for key themes, intent, or specific topics, and create a title that is clear, specific, and engaging. Avoid vague or overly general titles. If the query is ambiguous, focus on the most prominent topic or question.

Example: Query: "What are the best strategies for improving time management skills?" Chat Title: "Effective Time Management Strategies"
						`,
		}),
	});

	if (!res.ok) {
		throw new Error("Failed to generate title");
	}

	const title = await res.text();
	db.runAsync(`UPDATE conversations SET title = ? WHERE id = ?`, title, id);

	return title.trim();
}

export async function renameChat(
	db: SQLite.SQLiteDatabase,
	id: string,
	newTitle: string,
) {
	await db.runAsync(
		`UPDATE conversations SET title = ? WHERE id = ?`,
		newTitle,
		id,
	);
}

export async function getAllConversations(db: SQLite.SQLiteDatabase) {
	const conversations = await db.getAllAsync(
		`SELECT * FROM conversations ORDER BY created_at DESC`,
	);

	return conversations;
}

export async function getConversation(db: SQLite.SQLiteDatabase, id: string) {
	const conversation = await db.getFirstAsync(
		`SELECT * FROM conversations WHERE id = ?`,
		id,
	);

	if (!conversation) {
		throw new Error(`Conversation with ID ${id} not found`);
	}

	const messages = await db.getAllAsync(
		`SELECT * FROM messages WHERE conversation_id = ? ORDER BY sent_at ASC`,
		id,
	);

	const result = {
		...conversation,
		messages,
	};

	return result as any;
}
