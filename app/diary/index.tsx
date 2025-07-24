import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from "@/components/ui/Spinner";
import { getAllConversations } from "@/lib/data/chats";
import { fetchDiaryEntries, populateDiaryEntry } from "@/lib/data/diary";
import { Conversation, DiaryEntry } from "@/types";
import { formatDate } from "@/utils";
import { Colors } from "@/utils/constants/Colors";

const Diary = () => {
	const date = new Date();
	const day = date.toLocaleString("default", { weekday: "short" });
	const dateNumber = date.getDate();
	const [entries, setEntries] = useState<DiaryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [todaysEntry, setTodaysEntry] = useState<DiaryEntry | null>(null);
	const [conversations, setConversations] = useState<Conversation[]>([]);

	const screenWidth = Dimensions.get("window").width;
	const itemWidth = (screenWidth - 48) / 4 - 3 * 4; // 48 for padding, 3*4 for margins

	const router = useRouter();

	async function handlePopulateEntry() {
		// TODO: pass real user id
		const entryData = await populateDiaryEntry(
			"a8530ab2-1932-4073-a5bb-054178937967",
		);
		setTodaysEntry(entryData);
	}

	useEffect(() => {
		async function fetchEntries() {
			const entries = await fetchDiaryEntries(
				"a8530ab2-1932-4073-a5bb-054178937967",
			);
			const todaysEntry = entries.find(
				(entry) =>
					new Date(entry.date).toISOString().split("T")[0] ===
					date.toISOString().split("T")[0],
			);

			if (todaysEntry) {
				setTodaysEntry(todaysEntry);
				setEntries(
					entries.filter((entry) => entry.id !== todaysEntry.id).slice(0, 8),
				);
			} else {
				setEntries(entries.slice(0, 8));
			}
			setLoading(false);
		}

		async function fetchConversations() {
			const conversations = await getAllConversations(
				"a8530ab2-1932-4073-a5bb-054178937967",
			);
			setConversations(conversations.slice(0, 5));
		}

		fetchConversations();
		fetchEntries();
	}, []);

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
			<Text
				style={{
					fontSize: 18,
					fontFamily: "Geist",
					paddingHorizontal: -12,
					marginBottom: 8,
					color: "#2c3e50",
					fontWeight: "bold",
				}}
			>
				Diary - June
			</Text>
			<Pressable
				onPress={() => {
					if (todaysEntry) {
						router.push(`/diary/${todaysEntry.id}`);
						return;
					}
					handlePopulateEntry();
				}}
				style={{
					gap: 16,
					flexDirection: "row",
					alignItems: "center",
					marginBottom: 8,
					marginTop: 16,
				}}
			>
				<View style={{ alignItems: "center", width: 40 }}>
					<Text
						style={{
							fontFamily: "Geist",
							fontSize: 12,
							color: Colors.light.text,
						}}
					>
						{day}
					</Text>
					<Text
						style={{
							fontFamily: "Geist",
							fontSize: 16,
							color: Colors.light.background,
							backgroundColor: Colors.light.tabIconDefault,
							padding: 8,
							borderRadius: 40,
						}}
					>
						{dateNumber}
					</Text>
				</View>
				{todaysEntry ? (
					<Text
						style={{
							flex: 1,
							fontFamily: "Geist",
							fontSize: 18,
						}}
					>
						Check today's entry
					</Text>
				) : (
					<Text
						style={{
							flex: 1,
							fontFamily: "Geist",
							fontSize: 18,
							color: "#666",
						}}
					>
						No entry for today
					</Text>
				)}
			</Pressable>

			<View
				style={{
					flexDirection: "row",
					marginTop: 16,
					flexWrap: "wrap",
					// justifyContent: "space-between",
					// flex: 1,
					gap: 12,
				}}
			>
				{entries.map((item) => (
					<Pressable
						key={item.id}
						style={{
							backgroundColor: "#e7e5e4",
							borderRadius: 8,
							paddingVertical: 8,
							width: itemWidth,
							height: itemWidth,
							justifyContent: "center",
						}}
						onPress={() => router.push(`/diary/${item.id}`)}
					>
						<Text
							style={{
								fontSize: 18,
								fontFamily: "Geist",
								color: Colors.light.text,
								textAlign: "center",
							}}
						>
							{new Date(item.date).toLocaleDateString("default", {
								day: "numeric",
							})}
						</Text>
					</Pressable>
				))}
			</View>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: 32,
					marginBottom: 8,
				}}
			>
				<Text
					style={{
						fontSize: 18,
						fontFamily: "Geist",
						color: "#2c3e50",
						fontWeight: "bold",
					}}
				>
					Conversations
				</Text>
				<Pressable
					onPress={() => router.push("/library")}
					style={{ padding: 8 }}
				>
					<Text>See all</Text>
				</Pressable>
			</View>
			<View style={{ marginTop: 8 }}>
				{conversations.map((item) => (
					<Pressable
						key={item.id}
						style={{
							borderRadius: 8,
							paddingVertical: 8,
							paddingHorizontal: 8,
							flexDirection: "row",
							alignItems: "center",
						}}
						onPress={() => router.push(`/voice/${item.id}`)}
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
								{item.title?.trim() ||
									`Chat from ${formatDate(new Date(item.createdAt!))}`}
							</Text>
							<Text
								style={{
									fontSize: 12,
									fontFamily: "Geist",
									color: "#7f8c8d",
								}}
							>
								{formatDate(item.createdAt!).toString()}
							</Text>
						</View>
					</Pressable>
				))}
			</View>
		</SafeAreaView>
	);
};

export default Diary;
