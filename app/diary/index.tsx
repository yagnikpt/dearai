import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from "@/components/ui/Spinner";
import { fetchDiaryEntries, populateDiaryEntry } from "@/lib/data/diary";
import { DiaryEntry } from "@/types";
import { Colors } from "@/utils/constants/Colors";

const Diary = () => {
	const date = new Date();
	const day = date.toLocaleString("default", { weekday: "short" });
	const dateNumber = date.getDate();
	const [entries, setEntries] = useState<DiaryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [todaysEntry, setTodaysEntry] = useState<DiaryEntry | null>(null);

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
				setEntries(entries.filter((entry) => entry.id !== todaysEntry.id));
			} else {
				setEntries(entries);
			}
			setLoading(false);
		}
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
			<View
				style={{
					flex: 1,
					gap: 16,
					marginTop: 16,
				}}
			>
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
							{todaysEntry.summary.substring(0, 20) || "No summary available"}
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
				{entries.map((item, i) => (
					<Pressable
						onPress={() => {
							router.push(`/diary/${item.id}`);
						}}
						key={i}
						style={{
							gap: 16,
							flexDirection: "row",
							alignItems: "center",
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
								{item.date.toLocaleString("default", { weekday: "short" })}
							</Text>
							<Text
								style={{
									fontFamily: "Geist",
									fontSize: 16,
									color: Colors.light.text,
								}}
							>
								{item.date.toLocaleString("default", {
									month: "short",
									day: "numeric",
								})}
							</Text>
						</View>
						<Text
							style={{
								flex: 1,
								fontFamily: "Geist",
								fontSize: 18,
							}}
						>
							{item.summary.substring(0, 20) || "No summary available"}
						</Text>
					</Pressable>
				))}
			</View>
		</SafeAreaView>
	);
};

export default Diary;
