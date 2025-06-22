import { fetch } from "expo/fetch";
import { DiaryEntry } from "@/types";
import { generateAPIUrl } from "@/utils";

export async function populateDiaryEntry(userId: string): Promise<DiaryEntry> {
	const response = await fetch(generateAPIUrl("/api/diary"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ userId }),
	});

	if (!response.ok) {
		throw new Error("Failed to create diary entry");
	}

	const data = await response.json();
	return data;
}

export async function fetchDiaryEntries(userId: string): Promise<DiaryEntry[]> {
	const response = await fetch(generateAPIUrl(`/api/diary?userId=${userId}`));

	if (!response.ok) {
		throw new Error("Failed to fetch diary entries");
	}

	const data = await response.json();

	return data;
}

export async function fetchDiaryEntryById(
	id?: string,
	userId?: string,
): Promise<(DiaryEntry & { conversations: any[] }) | null> {
	const response = await fetch(
		generateAPIUrl(`/api/diary?id=${id || ""}&userId=${userId || ""}`),
	);

	if (!response.ok) {
		throw new Error("Failed to fetch diary entry");
	}

	const data = await response.json();
	return data;
}
