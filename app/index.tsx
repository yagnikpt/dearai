import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import AudioLinesIcon from "@/assets/icons/audio-lines.svg";
import BandageIcon from "@/assets/icons/bandage.svg";
import BookOpenIcon from "@/assets/icons/book-open.svg";
import SpeakerWaveIcon from "@/assets/icons/speaker-wave.svg";
import { useGradualAnimation } from "@/hooks/useGradualAnimation";
import { createChat } from "@/tools/chat-store";
import * as Crypto from "expo-crypto";
import { Image, ImageBackground } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite"; // Added import
import { useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const quickActions = [
	{
		title: "Read me a book",
		icon: BookOpenIcon,
	},
	{
		title: "Personal therapy",
		icon: BandageIcon,
	},
	{
		title: "Tell me a story",
		icon: SpeakerWaveIcon,
	},
];

export default function HomeScreen() {
	const [input, setInput] = useState("");
	const opacity = useSharedValue(1);
	const router = useRouter();
	const db = useSQLiteContext();
	const { height } = useGradualAnimation();

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

	const keyboardPadding = useAnimatedStyle(() => {
		return {
			height: height.value,
		};
	}, []);
	const animatedStyles = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
		};
	});

	const hideSection = () => {
		"worklet";
		opacity.value = withTiming(0, {
			duration: 200,
			easing: Easing.out(Easing.cubic),
		});
	};

	const showSection = () => {
		"worklet";
		opacity.value = withTiming(1, {
			duration: 200,
			easing: Easing.in(Easing.cubic),
		});
	};

	useKeyboardHandler(
		{
			onStart: (e) => {
				"worklet";
				if (e.height === 0) showSection();
				else hideSection();
			},
		},
		[],
	);

	async function handleSubmit() {
		try {
			if (input.length === 0) return;
			const id = await createChat(db, input.substring(0, 20));
			router.push({
				pathname: `/chat/[id]`,
				params: { initial: input, id },
			});
			setInput("");
		} catch (error) {
			console.error("Error creating chat:", error);
		}
	}

	return (
		<View style={{ flex: 1 }}>
			<ImageBackground
				source={require("../assets/images/bg-4.png")}
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "#fcf5f2",
				}}
				contentFit="cover"
			/>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<Link aria-label="Open Chats" href="/library">
						<ArrowLeftIcon width={24} height={24} color={"#555"} />
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
				<Animated.View style={[styles.center, animatedStyles]}>
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
					{/* <View>
							<Text
								style={{
									fontSize: 50,
									fontWeight: "300",
									color: "#333",
									fontFamily: "PlayfairDisplay",
									letterSpacing: -2,
								}}
							>
								Hello Yagnik
							</Text>
							<Text
								style={{
									fontSize: 50,
									fontWeight: "300",
									fontFamily: "PlayfairDisplay",
									color: "#333",
									lineHeight: 60,
									letterSpacing: -2,
								}}
							>
								How can i help you today?
							</Text>
						</View>
						<Text
							style={{
								fontSize: 16,
								color: "#555",
								width: "90%",
								fontFamily: "Geist",
							}}
						>
							I'm here to support your mental wellbeing through conversation or
							just being a listening ear whenever you need it.
						</Text> */}
				</Animated.View>
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
											backgroundColor: "#f5e4e4",
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
												backgroundColor: "#fff",
												padding: 8,
												borderRadius: 8,
											}}
										>
											<Icon width={24} height={24} color={"#777"} />
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
					<View style={styles.inputContainer}>
						<View
							style={{
								borderRadius: 9999,
								boxShadow:
									"0px 1px 3px 2px rgba(255, 221, 216, 1), 0px 2px 10px 6px rgba(255, 221, 216, 0.75)",
							}}
						>
							<Image
								source={require("../assets/images/gradi3.png")}
								style={{
									width: 32,
									height: 32,
									borderRadius: 9999,
								}}
								contentFit="cover"
								transition={300}
							/>
						</View>
						<TextInput
							placeholder="Type your thoughts here..."
							style={styles.input}
							placeholderTextColor="#999"
							value={input}
							onChangeText={(text) => setInput(text)}
							onSubmitEditing={handleSubmit}
						/>
						<Pressable
							style={{
								padding: 8,
								borderRadius: 16,
								backgroundColor: "#f5e4e4",
							}}
							onPress={() => router.push(`/voice/${Crypto.randomUUID()}`)}
						>
							<AudioLinesIcon width={20} height={20} stroke={"#666"} />
						</Pressable>
					</View>
				</View>
			</SafeAreaView>
			<Animated.View style={keyboardPadding} />
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
		// paddingHorizontal: 8,
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
		borderRadius: 9999,
		gap: 12,
		boxShadow:
			"0px 0px 1px 2px rgba(255, 221, 216, 0.25), 0px 0px 10px 10px rgba(255, 221, 216, 0.25)",
	},
	input: {
		flexGrow: 1,
		fontSize: 16,
		fontFamily: "Geist",
		color: "#333",
	},
});
