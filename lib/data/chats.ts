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
	if (!id || !initial) {
		return "";
	}

	const res = await fetch(generateAPIUrl("/api/llm-utility"), {
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
	const trimmedTitle = title.trim();

	await fetch(generateAPIUrl("/api/conversation"), {
		method: "UPDATE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			id,
			title: trimmedTitle,
			updatedAt: new Date(),
		}),
	});
	return trimmedTitle;
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
export async function getAllConversations(userId: string) {
	const response = await fetch(
		generateAPIUrl(`/api/conversation?userId=${userId}`),
	);

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
