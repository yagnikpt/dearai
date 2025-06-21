import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AudioLinesIcon from "@/assets/icons/audio-lines.svg";
import BookOpenIcon from "@/assets/icons/book-open.svg";
import MenuIcon from "@/assets/icons/burger-menu-left.svg";
import CapsuleIcon from "@/assets/icons/capsule.svg";
import SpeakerWaveIcon from "@/assets/icons/speaker-wave.svg";
import { Colors } from "@/utils/constants/Colors";

const quickActions = [
	{
		title: "Read me a book",
		icon: BookOpenIcon,
	},
	{
		title: "Personal therapy",
		icon: CapsuleIcon,
	},
	{
		title: "Tell me a story",
		icon: SpeakerWaveIcon,
	},
];

export default function HomeScreen() {
	const router = useRouter();

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) {
			return "morning";
		}
		if (hour < 18) {
			return "afternoon";
		}
		return "evening";
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient
				colors={[Colors.light.background, Colors.light.tintAlt]}
				style={StyleSheet.absoluteFill}
			/>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<Link aria-label="Open Library" href="/library">
						<MenuIcon width={24} height={24} color={"#222"} />
					</Link>
					<Text
						style={{
							fontFamily: "Geist",
							fontSize: 18,
							fontWeight: "bold",
							color: "#333",
							position: "absolute",
							left: "0%",
							width: "100%",
							textAlign: "center",
							zIndex: -1,
						}}
					>
						DearAI
					</Text>
				</View>
				<View style={styles.center}>
					<Text
						style={{
							fontSize: 36,
							fontWeight: "300",
							color: "#333",
							textAlign: "center",
							fontFamily: "PlayfairDisplay",
							letterSpacing: -2,
						}}
					>
						How can i help you this {getGreeting()}?
					</Text>
				</View>
				<View style={styles.bottom}>
					<ScrollView
						style={{ borderRadius: 12 }}
						horizontal
						showsHorizontalScrollIndicator={false}
					>
						<View
							style={{
								flexDirection: "row",
								gap: 10,
							}}
						>
							{quickActions.map((action) => {
								const Icon = action.icon;
								return (
									<Pressable
										key={action.title}
										style={{
											padding: 8,
											backgroundColor: "#fff",
											borderRadius: 12,
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
											maxWidth: 150,
										}}
										onPress={() => {}}
									>
										<View
											style={{
												backgroundColor: "#FDEDDE",
												padding: 8,
												borderRadius: 8,
											}}
										>
											<Icon
												width={24}
												height={24}
												color={"#777"}
												strokeWidth={1.5}
											/>
										</View>
										<Text
											style={{
												fontSize: 14,
												flexShrink: 1,
												fontFamily: "Geist",
												color: "#37333d",
											}}
										>
											{action.title}
										</Text>
									</Pressable>
								);
							})}
						</View>
					</ScrollView>
					<Pressable
						style={{
							padding: 16,
							borderRadius: 16,
							backgroundColor: "#fff",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "center",
							gap: 12,
							borderWidth: 2,
							borderColor: Colors.light.tint,
						}}
						onPress={() =>
							router.push(`/voice/${Crypto.randomUUID()}?new=true`)
						}
					>
						<Text
							style={{
								textAlign: "center",
								fontFamily: "Geist",
								fontWeight: "bold",
								color: "#444",
							}}
						>
							Start Voice Chat
						</Text>
						<AudioLinesIcon width={20} height={20} stroke={Colors.light.icon} />
					</Pressable>
				</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		justifyContent: "space-between",
		paddingVertical: 16,
		paddingHorizontal: 20,
	},
	title: {
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 24,
		fontFamily: "PlayfairDisplay",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	center: {
		gap: 12,
	},
	bottom: {
		gap: 16,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginHorizontal: 2,
		backgroundColor: "#fff",
		borderRadius: 32,
		gap: 12,
		boxShadow:
			"0px 0px 1px 2px rgba(254, 229, 206, 0.25), 0px 0px 10px 10px rgba(254, 229, 206, 0.25)",
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontFamily: "Geist",
		color: "#333",
	},
});
