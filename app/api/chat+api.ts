import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import SystemPrompt from "@/utils/constants/SystemPrompt";

const google = createGoogleGenerativeAI({
	apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();

	const result = streamText({
		model: google("gemini-2.0-flash"),
		system: SystemPrompt,
		messages: convertToModelMessages(messages),
	});

	return result.toUIMessageStreamResponse();
}
