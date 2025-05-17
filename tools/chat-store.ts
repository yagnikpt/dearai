import * as Crypto from "expo-crypto";
import type * as SQLite from "expo-sqlite";

export async function createChat(db: SQLite.SQLiteDatabase, title: string) {
	const id = Crypto.randomUUID();
	await db.runAsync(
		`
		INSERT INTO conversations (id, title)
		VALUES (?, ?)
	`,
		id,
		title,
	);
	return id;
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
	} catch (error) {
		console.error("Error adding message:", error);
		throw error;
	}
}

export async function deleteChat(db: SQLite.SQLiteDatabase, id: string) {
	await db.runAsync(`DELETE FROM conversations WHERE id = ?`, id);
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
