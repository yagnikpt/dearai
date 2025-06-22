import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";

// Temporary default user ID until auth is implemented
const DEFAULT_USER_ID = "a8530ab2-1932-4073-a5bb-054178937967";

// POST endpoint to create a new chat
export async function POST(request: Request) {
	try {
		const { title, id } = await request.json();

		const hash = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			`${title}${id}${DEFAULT_USER_ID}`,
		);

		await db.insert(conversations).values({
			id,
			userId: DEFAULT_USER_ID,
			title,
			contentHash: hash,
			diarySavepointHash: hash,
		});

		return Response.json({ id });
	} catch (error) {
		console.error("Error creating chat:", error);
		return new Response(JSON.stringify({ error: "Failed to create chat" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}

// DELETE endpoint to delete a chat
export async function DELETE(request: Request) {
	try {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");

		if (!id) {
			return new Response(JSON.stringify({ error: "Chat ID is required" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		await db.delete(conversations).where(eq(conversations.id, id));

		return Response.json({ success: true });
	} catch (error) {
		console.error("Error deleting chat:", error);
		return new Response(JSON.stringify({ error: "Failed to delete chat" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
