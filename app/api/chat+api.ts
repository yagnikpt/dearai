// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { streamText } from "ai";

// const google = createGoogleGenerativeAI({
// 	apiKey: process.env.GEMINI_API_KEY,
// });

// export async function POST(req: Request) {
// 	const { messages } = await req.json();

// 	const result = streamText({
// 		model: google("gemini-2.0-flash"),
// 		messages,
// 	});

// 	return result.toDataStreamResponse({
// 		headers: {
// 			"Content-Type": "application/octet-stream",
// 			"Content-Encoding": "none",
// 		},
// 	});
// }

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type UIMessage, convertToModelMessages, streamText } from "ai";

const google = createGoogleGenerativeAI({
	apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();

	const result = streamText({
		model: google("gemini-2.0-flash"),
		messages: convertToModelMessages(messages),
	});

	return result.toUIMessageStreamResponse();
}
