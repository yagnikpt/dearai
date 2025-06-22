import { and, eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";

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

		// TODO: might happen a race condition

		const rec = await db
			.insert(messages)
			.values({
				conversationId,
				content,
				role,
				type: type || "text",
				metadata: metadata || null,
			})
			.returning();

		if (conversationId && role === "user") {
			const conversation = await db.query.conversations.findFirst({
				where: eq(conversations.id, conversationId),
				with: {
					messages: {
						where: eq(messages.role, "user"),
						orderBy: messages.createdAt,
					},
				},
			});

			const existingUserMessage = conversation?.messages || [];
			if (existingUserMessage.length > 0) {
				const joined = existingUserMessage.map((msg) => msg.content).join(" ");
				const hash = await Crypto.digestStringAsync(
					Crypto.CryptoDigestAlgorithm.SHA256,
					joined,
				);
				if (hash !== conversation?.contentHash) {
					await db
						.update(conversations)
						.set({
							contentHash: hash,
							updatedAt: new Date(),
						})
						.where(eq(conversations.id, conversationId));
				}
			}
		}

		return Response.json(rec[0]);
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
