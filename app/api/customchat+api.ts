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
				"Only output content in plain text form that i can feed into a TTS service.",
		},
		history: [
			...messages.map((message) => ({
				role: message.role === "user" ? "user" : "model",
				parts: [createPartFromText(message.content)],
			})),
		],
	});

	const response = await chat.sendMessage({
		message: input,
	});

	return new Response(response.text);
}
