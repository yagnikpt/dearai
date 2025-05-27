import { GoogleGenAI, createPartFromText } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
	const {
		query,
		system_prompt,
		ai_response,
	}: { query: string; system_prompt?: string; ai_response?: string } =
		await req.json();

	const response = await ai.models.generateContent({
		model: "gemini-2.0-flash",
		config: system_prompt
			? {
					systemInstruction: system_prompt,
				}
			: undefined,
		contents: ai_response
			? [
					{
						role: "user",
						parts: [createPartFromText(query)],
					},
					{
						role: "assistant",
						parts: [createPartFromText(ai_response)],
					},
				]
			: [
					{
						role: "user",
						parts: [createPartFromText(query)],
					},
				],
	});

	return new Response(response.text);
}
