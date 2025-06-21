import { fetch } from "expo/fetch";
import { generateAPIUrl } from "@/utils";

// Create a new chat conversation
export async function createChat(id: string, title: string): Promise<string> {
	const response = await fetch(generateAPIUrl("/api/chats"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id, title }),
	});

	if (!response.ok) {
		throw new Error("Failed to create chat");
	}

	const data = await response.json();
	return data.id;
}

// Add a message to a conversation
export async function addMessage(
	conversationId: string,
	content: string,
	role: "user" | "assistant" | "system",
	type: "text" | "image" = "text",
	metadata?: Record<string, any>,
) {
	try {
		const response = await fetch(generateAPIUrl("/api/messages"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				conversationId,
				content,
				role,
				type,
				metadata,
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to add message");
		}

		return await response.json();
	} catch (error) {
		console.error("Error adding message:", error);
		throw error;
	}
}

// Delete a chat conversation and its messages
export async function deleteChat(id: string) {
	const response = await fetch(generateAPIUrl(`/api/chats?id=${id}`), {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete chat");
	}
}

// Generate a title for a chat using AI
export async function generateTitle(
	id: string,
	initial: string,
): Promise<string> {
	const response = await fetch(generateAPIUrl("/api/title"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			id,
			initial,
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to generate title");
	}

	const data = await response.json();
	return data.title;
}

// Rename a chat conversation
export async function renameChat(id: string, newTitle: string) {
	const response = await fetch(generateAPIUrl("/api/title"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			id,
			newTitle,
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to rename chat");
	}
}

// Get all conversations
export async function getAllConversations() {
	const response = await fetch(generateAPIUrl("/api/conversation"));

	if (!response.ok) {
		throw new Error("Failed to fetch conversations");
	}

	return await response.json();
}

// Get a single conversation with all its messages
export async function getConversation(id: string) {
	const response = await fetch(generateAPIUrl(`/api/conversation?id=${id}`));

	if (!response.ok) {
		throw new Error(`Failed to fetch conversation with ID ${id}`);
	}

	return await response.json();
}
