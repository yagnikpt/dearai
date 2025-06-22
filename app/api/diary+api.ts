import { createPartFromText, GoogleGenAI } from "@google/genai";
import { desc, eq, not } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	conversations,
	conversationsToDiary,
	diaryEntry,
	users,
} from "@/lib/db/schema";
import { DiaryEntry } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
	try {
		const { userId } = await request.json();

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			with: {
				conversations: {
					with: {
						messages: {
							orderBy: (m) => desc(m.createdAt),
						},
					},
					where: (c) => not(eq(c.diarySavepointHash, c.contentHash)),
					orderBy: (c) => desc(c.updatedAt),
				},
				diaryEntries: {
					orderBy: (d) => desc(d.date),
					with: {
						conversations: {
							columns: {
								conversationId: true,
							},
						},
					},
				},
			},
		});

		if (!user) {
			console.log("User not found:", userId);

			return new Response(JSON.stringify({ message: "User not found" }), {
				status: 404,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		const diaryExists = user.diaryEntries.find(
			(entry) =>
				entry.date.toISOString().split("T")[0] ===
				new Date().toISOString().split("T")[0],
		);

		if (!user.conversations.length) {
			console.log("No updates found for user:", userId);
			return new Response(JSON.stringify({ message: "No updates" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		let newMessages: (typeof user.conversations)[0]["messages"] = [];

		for (const conversation of user.conversations) {
			if (!conversation.messageSavePointId) {
				newMessages = newMessages.concat(conversation.messages);
				continue;
			}
			const index = conversation.messages.findIndex(
				(m) => m.id === conversation.messageSavePointId,
			);
			const requiredMessages = conversation.messages.slice(0, index + 1);
			newMessages = newMessages.concat(requiredMessages);
		}

		const lastSummary = user.diaryEntries[0]?.summary || null;

		const contents = `
			Conversation: 
			${newMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n")}
			${lastSummary ? `\n\nLast Conversation Summary (use only if related): ${lastSummary}` : ""}
		`;

		const response = await ai.models.generateContent({
			model: "gemini-2.0-flash",
			config: {
				systemInstruction: `As a mental health care assistant AI, create a concise, empathetic, and professional summary of our conversation, narrated in the first person. Focus on the user's key concerns, emotions, and needs expressed during the dialogue, while maintaining their privacy by avoiding specific personal details. Highlight any coping strategies, insights, or resources I provided, and note the user's responses or progress. Use a warm, supportive tone, and structure the summary to reflect the flow of the conversation, concluding with any agreed-upon next steps or encouragement for the user's well-being. Keep the summary under 200 words.`,
			},
			contents,
		});

		let entry: DiaryEntry[];

		if (diaryExists) {
			entry = await db
				.update(diaryEntry)
				.set({
					summary: response.text!,
					updatedAt: new Date(),
				})
				.where(eq(diaryEntry.id, diaryExists.id))
				.returning();
			for (const conversation of user.conversations) {
				if (
					!diaryExists.conversations.find(
						(c) => c.conversationId === conversation.id,
					)
				) {
					await db.insert(conversationsToDiary).values({
						diaryEntryId: diaryExists.id,
						conversationId: conversation.id,
					});
				}
			}
		} else {
			entry = await db
				.insert(diaryEntry)
				.values({
					userId: user.id,
					date: new Date(),
					summary: response.text!,
				})
				.returning();
			for (const conversation of user.conversations) {
				await db.insert(conversationsToDiary).values({
					diaryEntryId: entry[0].id,
					conversationId: conversation.id,
				});
			}
		}

		for (const conversation of user.conversations) {
			await db
				.update(conversations)
				.set({
					diarySavepointHash: conversation.contentHash,
					messageSavePointId:
						conversation.messages[conversation.messages.length - 1].id,
				})
				.where(eq(conversations.id, conversation.id));
		}
		return Response.json(entry[0]);
	} catch (error) {
		console.error("Error creating diary entry:", error);
		return new Response(
			JSON.stringify({ error: "Failed to create diary entry" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");
		const userId = url.searchParams.get("userId");

		if (!id) {
			const result = await db
				.select()
				.from(diaryEntry)
				.where(eq(diaryEntry.userId, userId || ""))
				.orderBy(desc(diaryEntry.updatedAt));

			return Response.json(result);
		}

		// Get the specific diary entry
		const entry = await db.query.diaryEntry.findFirst({
			where: eq(diaryEntry.id, id),
			with: {
				conversations: {
					with: {
						conversation: true,
					},
				},
			},
		});

		if (!entry) {
			return new Response(
				JSON.stringify({ error: `Diary entry with ID ${id} not found` }),
				{
					status: 404,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		return Response.json(entry);
	} catch (error) {
		console.error("Error fetching diary entry:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch diary entry" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}
