import { eq } from "drizzle-orm";
import { fetch } from "expo/fetch";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { generateAPIUrl } from "@/utils";

// POST endpoint to generate or update a chat title
export async function POST(request: Request) {
	try {
		const { id, initial } = await request.json();

		if (!id) {
			return new Response(JSON.stringify({ error: "Chat ID is required" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		// For new title generation
		if (initial) {
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
			const trimmedTitle = title.trim();

			await db
				.update(conversations)
				.set({ title: trimmedTitle, updatedAt: new Date() })
				.where(eq(conversations.id, id));

			return Response.json({ title: trimmedTitle });
		}

		// For title updates (rename)
		const { newTitle } = await request.json();

		if (!newTitle) {
			return new Response(JSON.stringify({ error: "New title is required" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		await db
			.update(conversations)
			.set({ title: newTitle, updatedAt: new Date() })
			.where(eq(conversations.id, id));

		return Response.json({ title: newTitle });
	} catch (error) {
		console.error("Error updating title:", error);
		return new Response(JSON.stringify({ error: "Failed to update title" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
