import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

// POST endpoint to add a message to a conversation
export async function POST(request: Request) {
	try {
		const { conversationId, content, role, type, metadata } =
			await request.json();

		if (!conversationId || !content || !role) {
			return new Response(
				JSON.stringify({ error: "Missing required fields" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		const rec = await db
			.insert(messages)
			.values({
				conversationId,
				content,
				role,
				type: type || "text",
				metadata: metadata || null,
			})
			.returning({
				id: messages.id,
			});

		const [msg] = await db
			.select()
			.from(messages)
			.where(eq(messages.id, rec[0].id));

		return Response.json(msg);
	} catch (error) {
		console.error("Error adding message:", error);
		return new Response(JSON.stringify({ error: "Failed to add message" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
