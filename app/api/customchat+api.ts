import { createPartFromText, GoogleGenAI } from "@google/genai";
import type { Message } from "@/types";
import SystemPrompt from "@/utils/constants/SystemPrompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
	const { messages, input }: { messages: Message[]; input: string } =
		await req.json();

	const chat = ai.chats.create({
		model: "gemini-2.0-flash",
		config: {
			systemInstruction:
				SystemPrompt +
				"\n\n Do not output content with formatting, such as markdown or HTML. Just output plain text.",
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
				await writer.write(encoder.encode(part.text));
			}
		}
		await writer.close();
	})();

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
