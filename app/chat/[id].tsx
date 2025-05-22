import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg";
import AudioLinesIcon from "@/assets/icons/audio-lines.svg";
import SquarePenIcon from "@/assets/icons/square-pen.svg";
import Spinner from "@/components/ui/Spinner";
import { addMessage, getConversation } from "@/tools/chat-store";
import type { Conversation } from "@/types";
import { generateAPIUrl } from "@/utils";
import { useChat } from "@ai-sdk/react";
import { defaultChatStore } from "ai";
import * as Crypto from "expo-crypto";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite"; // Added import
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
	const { id, initial } = useLocalSearchParams<{
		id: string;
		initial?: string;
	}>();
	const [conversationData, setConversationData] = useState<Conversation | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [initalError, setInitialError] = useState<string | null>(null);
	const db = useSQLiteContext();
	const router = useRouter();

	const handleBack = () => {
		router.back();
	};

	const handleHomePage = () => {
		router.replace(`/`);
	};

	const {
		messages,
		input,
		error,
		setMessages,
		handleSubmit,
		handleInputChange,
	} = useChat({
		chatStore: defaultChatStore({
			api: generateAPIUrl("/api/chat"),
			fetch: expoFetch as unknown as typeof globalThis.fetch,
			generateId: Crypto.randomUUID,
		}),
		initialInput: initial,
		onError: (error) => console.error(error),
		onFinish: async ({ message }) => {
			let content = "";
			if (message.parts && Array.isArray(message.parts)) {
				for (const part of message.parts) {
					if (part.type === "text" && part.text) {
						content += part.text;
					}
				}
			}

			await addMessage(db, id, content, message.role);
		},
	});

	useEffect(() => {
		const loadConversation = async () => {
			try {
				if (initial) {
					await addMessage(db, id, initial, "user");
					handleSubmit();
					const data = await getConversation(db, id);
					setConversationData(data);
				} else {
					const data = await getConversation(db, id);
					if (data) {
						const { messages: initialMessages, ...rest } = data;
						setConversationData(rest);
						if (initialMessages) {
							const formatedMessages = initialMessages.map((message: any) => ({
								id: message.id,
								role: message.role,
								parts: [
									{
										type: "text",
										text: message.content,
									},
								],
							}));
							setMessages(formatedMessages);
						}
					}
				}
			} catch (err) {
				setInitialError((err as Error).message);
			} finally {
				setLoading(false);
			}
		};
		try {
			loadConversation();
		} catch (error) {
			console.error("Error loading conversation:", error);
		}
	}, [id, initial]);

	if (initalError) {
		return (
			<SafeAreaView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
			>
				<Text>Conversation not found: {initalError}</Text>
			</SafeAreaView>
		);
	}

	if (error)
		return (
			<SafeAreaView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
			>
				<Text>{error.message}</Text>
			</SafeAreaView>
		);

	if (loading) {
		return (
			<SafeAreaView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
			>
				<Spinner size={50} />
			</SafeAreaView>
		);
	}

	return (
		<KeyboardAvoidingView
			// contentContainerStyle={{ flex: 1 }}
			style={{ flex: 1 }}
			behavior="padding"
			keyboardVerticalOffset={-20}
		>
			<SafeAreaView style={{ flex: 1, backgroundColor: "#fcf5f2" }}>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						padding: 20,
					}}
				>
					<Pressable onPress={handleBack}>
						<ArrowLeftIcon width={24} height={24} stroke={"#444"} />
					</Pressable>
					<View style={{ flex: 1, paddingHorizontal: 24 }}>
						<Text
							numberOfLines={1}
							ellipsizeMode="tail"
							style={{
								fontSize: 18,
								fontFamily: "PlayfairDisplay",
								color: "#2c3e50",
								letterSpacing: -0.5,
								textAlign: "center",
							}}
						>
							{conversationData?.title || "Conversation"}
						</Text>
					</View>
					<Pressable onPress={handleHomePage}>
						<SquarePenIcon width={22} height={22} stroke={"#444"} />
					</Pressable>
				</View>

				<ScrollView
					style={{
						flex: 1,
						paddingHorizontal: 20,
						paddingTop: 16,
						// paddingBottom: 200,
					}}
				>
					{messages.map((m) => (
						<View key={m.id} style={{ marginVertical: 2 }}>
							{m.role === "user" ? (
								<Text
									style={{
										backgroundColor: "#ddd",
										maxWidth: "80%",
										textAlign: "right",
										marginLeft: "auto",
										paddingHorizontal: 16,
										paddingVertical: 8,
										borderRadius: 16,
										borderBottomRightRadius: 4,
										fontSize: 16,
										fontFamily: "Geist",
									}}
								>
									{m.parts.find((part) => part.type === "text")?.text}
								</Text>
							) : (
								<View style={{ marginBottom: 24 }}>
									<Markdown style={styles}>
										{m.parts.find((part) => part.type === "text")?.text}
									</Markdown>
								</View>
							)}
						</View>
					))}
				</ScrollView>

				<View
					style={{
						position: "fixed",
						bottom: 8,
						marginHorizontal: 20,
						borderRadius: 32,
						padding: 8,
						borderColor: "#ccc",
						borderWidth: 1,
						backgroundColor: "#fff",
						alignItems: "center",
						flexDirection: "row",
						gap: 8,
					}}
				>
					<TextInput
						multiline
						placeholderTextColor={"#999"}
						style={{ backgroundColor: "white", padding: 8, flex: 1 }}
						placeholder="Ask anything..."
						value={input}
						onChange={(e) =>
							handleInputChange({
								...e,
								target: {
									...e.target,
									value: e.nativeEvent.text,
								},
							} as unknown as React.ChangeEvent<HTMLInputElement>)
						}
					/>
					<Pressable
						style={{
							padding: 8,
							borderRadius: 16,
							backgroundColor: "#ddd",
						}}
						onPress={async (e) => {
							e.persist();
							await addMessage(db, id, input, "user");
							handleSubmit(e);
						}}
					>
						<ArrowUpIcon width={18} height={18} stroke={"#666"} />
					</Pressable>
					<Pressable
						style={{
							padding: 8,
							borderRadius: 16,
							backgroundColor: "#ddd",
						}}
						onPress={() => router.push(`/voice/${id}`)}
					>
						<AudioLinesIcon width={18} height={18} stroke={"#666"} />
					</Pressable>
				</View>
			</SafeAreaView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	body: {
		fontFamily: "Geist",
	},
});
