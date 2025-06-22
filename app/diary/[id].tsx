import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/solid";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from "@/components/ui/Spinner";
import { fetchDiaryEntryById, populateDiaryEntry } from "@/lib/data/diary";
import { DiaryEntry } from "@/types";
import { formatDate } from "@/utils";
import { Colors } from "@/utils/constants/Colors";

export default function DiaryPage() {
	const { id } = useLocalSearchParams<{
		id: string;
	}>();
	const router = useRouter();
	const [entry, setEntry] = useState<
		(DiaryEntry & { conversations: any[] }) | null
	>(null);
	const [loading, setLoading] = useState(true);

	async function handleRepopulateEntry() {
		await populateDiaryEntry("a8530ab2-1932-4073-a5bb-054178937967");
		router.reload();
	}

	useEffect(() => {
		async function fetchEntry() {
			const response = await fetchDiaryEntryById(id);
			setEntry(response);
			setLoading(false);
		}
		fetchEntry();
	}, [id]);

	if (loading) {
		return (
			<SafeAreaView
				style={{
					flex: 1,
					backgroundColor: Colors.light.background,
				}}
			>
				<Spinner size={50} />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: Colors.light.background,
				padding: 16,
				paddingHorizontal: 24,
			}}
		>
			<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
				<Pressable onPress={() => router.back()}>
					<ChevronLeftIcon
						size={24}
						color={Colors.light.text}
						style={{ marginRight: 8 }}
					/>
				</Pressable>
				<Text
					style={{
						fontSize: 18,
						fontFamily: "Geist",
						color: Colors.light.text,
					}}
				>
					{new Date(entry?.date || "").toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</Text>
				<Pressable
					onPress={handleRepopulateEntry}
					style={{ marginLeft: "auto" }}
				>
					<Text>Repopulate</Text>
				</Pressable>
			</View>
			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 0 }}>
				<Text
					style={{
						fontSize: 20,
						fontFamily: "Geist",
						color: Colors.light.text,
						fontWeight: "bold",
						marginTop: 32,
					}}
				>
					Summary
				</Text>
				<Markdown style={styles}>{entry?.summary}</Markdown>
				<Text
					style={{
						fontSize: 20,
						fontFamily: "Geist",
						color: Colors.light.text,
						fontWeight: "bold",
						marginTop: 16,
					}}
				>
					Related Conversations
				</Text>
				<View style={{ marginTop: 16, gap: 4 }}>
					{entry?.conversations.map((i) => (
						<Pressable
							key={i.conversation.id}
							style={{
								borderRadius: 8,
								paddingVertical: 8,
								paddingHorizontal: 24,
								marginBottom: 8,
								flexDirection: "row",
								alignItems: "center",
								backgroundColor: Colors.light.tintAlt,
							}}
							onPress={() => router.push(`/chat/${i.conversation.id}`)}
						>
							<View
								style={{
									flex: 1,
								}}
							>
								<Text
									style={{
										fontSize: 18,
										fontFamily: "Geist",
										color: "#34495e",
										marginBottom: 4,
									}}
								>
									{i.conversation.title?.trim() ||
										`Chat from ${formatDate(i.conversation.createdAt!)}`}
								</Text>
								<Text
									style={{
										fontSize: 12,
										fontFamily: "Geist",
										color: "#7f8c8d",
									}}
								>
									{formatDate(i.conversation.createdAt!).toString()}
								</Text>
							</View>
						</Pressable>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	body: {
		fontFamily: "Geist",
		fontSize: 16,
	},
});
