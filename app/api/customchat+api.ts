import type { Message } from "@/types";
import { GoogleGenAI, createPartFromText } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
	const { messages, input }: { messages: Message[]; input: string } =
		await req.json();

	const chat = ai.chats.create({
		model: "gemini-2.0-flash",
		config: {
			systemInstruction:
				"Only generate content in plain text format NOT in markdown",
		},
		history: [
			...messages.map((message) => ({
				role: message.role === "user" ? "user" : "model",
				parts: [createPartFromText(message.content)],
			})),
		],
	});

	const ai_message = await chat.sendMessageStream({
		message: input,
	});

	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	(async () => {
		for await (const part of ai_message) {
			if (part.text) {
				await writer.write(encoder.encode(`data: ${part.text}\\n\\n`));
			}
		}
		// After the loop, send a [DONE] message
		await writer.write(encoder.encode("data: [DONE]\\n\\n"));
		await writer.close();
	})();

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"Content-Encoding": "none",
		},
	});
}
