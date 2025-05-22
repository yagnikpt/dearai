export interface Conversation {
	id: string;
	title: string | null;
	start_time: string; // Assuming DATETIME is stored as string (ISO 8601)
	end_time: string | null;
	status: "active" | "ended" | "archived";
	created_at: string;
	updated_at: string | null;
}

export interface Message {
	id: string;
	conversation_id: string;
	role: "user" | "assistant";
	content: string;
	created_at: string;
	updated_at: string | null;
}
