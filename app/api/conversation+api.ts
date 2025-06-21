import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";

// Temporary default user ID until auth is implemented
const DEFAULT_USER_ID = "a8530ab2-1932-4073-a5bb-054178937967";

// GET endpoint to fetch a specific conversation by ID
export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");

		if (!id) {
			// If no ID is provided, return all conversations
			const result = await db
				.select()
				.from(conversations)
				.where(eq(conversations.userId, DEFAULT_USER_ID))
				.orderBy(desc(conversations.updatedAt));

			return Response.json(result);
		}

		// Get the specific conversation
		const [conversation] = await db
			.select()
			.from(conversations)
			.where(eq(conversations.id, id));

		if (!conversation) {
			return new Response(
				JSON.stringify({ error: `Conversation with ID ${id} not found` }),
				{
					status: 404,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		// Get all messages for this conversation
		const messageList = await db
			.select()
			.from(messages)
			.where(eq(messages.conversationId, id))
			.orderBy(messages.createdAt);

		return Response.json({
			...conversation,
			messages: messageList,
		});
	} catch (error) {
		console.error("Error fetching conversation:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch conversation" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}
