import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";

// GET endpoint to fetch a specific conversation by ID
export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");
		const userId = url.searchParams.get("userId");

		if (!id) {
			// If no ID is provided, return all conversations
			const result = await db
				.select()
				.from(conversations)
				.where(eq(conversations.userId, userId || ""))
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

export async function UPDATE(request: Request) {
	try {
		const payload = await request.json();
		console.log("Update payload:", payload);

		if (!payload) {
			return new Response(JSON.stringify({ error: "Payload is required" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		await db
			.update(conversations)
			.set(payload)
			.where(eq(conversations.id, payload.id));

		return Response.json({ success: true });
	} catch (error) {
		console.error("Error updating conversation:", error);
		return new Response(
			JSON.stringify({ error: "Failed to update conversation" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}
