import { addMessage, createChat, getConversation } from "@/tools/chat-store";
import type { Message } from "@/types";
import { generateAPIUrl } from "@/utils";
import { ImageBackground } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import {
	ExpoSpeechRecognitionModule,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useSQLiteContext } from "expo-sqlite";
import { fetch } from "expo/fetch";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
	MicrophoneIcon,
	SpeakerXMarkIcon,
	XMarkIcon,
} from "react-native-heroicons/outline";
import Animated, {
	Easing,
	FadeInDown,
	LinearTransition,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CustomTransition = LinearTransition.easing(
	Easing.inOut(Easing.ease),
).duration(200);

export default function Voice() {
	const { id } = useLocalSearchParams<{
		id: string;
	}>();
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>([]);
	const [recognizing, setRecognizing] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [isSpeaking, setIsSpeaking] = useState(false);
	const db = useSQLiteContext();

	const translateXCirc1 = useSharedValue(0);
	const translateYCirc1 = useSharedValue(150);
	const translateXCirc2 = useSharedValue(0);
	const translateYCirc2 = useSharedValue(150);
	const translateXCirc3 = useSharedValue(0);
	const translateYCirc3 = useSharedValue(150);

	useEffect(() => {
		let interval: NodeJS.Timeout;

		function getRandomXY() {
			const randomX = Math.floor(Math.random() * 101) - 50;
			// const randomY = Math.floor(Math.random() * 41) - 20;
			const randomY = 20;
			return { randomX, randomY };
		}

		const DURATION = 2000;
		function animateCircs() {
			const { randomX: rx1, randomY: ry1 } = getRandomXY();
			const { randomX: rx2, randomY: ry2 } = getRandomXY();
			const { randomX: rx3, randomY: ry3 } = getRandomXY();
			translateXCirc1.value = withTiming(rx1, { duration: DURATION });
			translateYCirc1.value = withTiming(ry1, { duration: DURATION });
			translateXCirc2.value = withTiming(rx2, { duration: DURATION });
			translateYCirc2.value = withTiming(ry2, { duration: DURATION });
			translateXCirc3.value = withTiming(rx3, { duration: DURATION });
			translateYCirc3.value = withTiming(ry3, { duration: DURATION });
		}

		animateCircs();
		interval = setInterval(animateCircs, DURATION + 100);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const circ1Styles = useAnimatedStyle(() => ({
		transform: [
			{ translateX: `${translateXCirc1.value}%` },
			{ translateY: `${translateYCirc1.value}%` },
			{ scale: 1.5 },
		],
		opacity: withTiming(1, { duration: 1000 }),
	}));

	const circ2Styles = useAnimatedStyle(() => ({
		transform: [
			{ translateX: `${translateXCirc2.value}%` },
			{ translateY: `${translateYCirc2.value}%` },
			{ scale: 1.5 },
		],
		opacity: withTiming(1, { duration: 1000 }),
	}));

	const circ3Styles = useAnimatedStyle(() => ({
		transform: [
			{ translateX: `${translateXCirc3.value}%` },
			{ translateY: `${translateYCirc3.value}%` },
			{ scale: 1.5 },
		],
		opacity: withTiming(1, { duration: 1000 }),
	}));

	useSpeechRecognitionEvent("start", () => setRecognizing(true));
	useSpeechRecognitionEvent("end", () => setRecognizing(false));
	useSpeechRecognitionEvent("result", async (event) => {
		setTranscript(event.results[0]?.transcript);
		if (event.isFinal) {
			if (messages.length === 0)
				await createChat(
					db,
					event.results[0]?.transcript ?? "New Voice Chat",
					id,
				);
			await handleSubmit(event.results[0]?.transcript ?? "");
		}
	});

	// useSpeechRecognitionEvent("error", (event) => {
	// 	console.error("error code:", event.error, "error message:", event.message);
	// });

	const handleStart = async () => {
		const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
		if (!result.granted) {
			console.warn("Permissions not granted", result);
			return;
		}
		ExpoSpeechRecognitionModule.start({
			lang: "en-US",
		});
	};

	async function handleSubmit(input: string) {
		if (!input) return;

		const msg: any = await addMessage(db, id, input, "user");
		setMessages((prev) => [...prev, msg]);
		setTranscript("");

		const res = await fetch(generateAPIUrl("/api/customchat"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: [...messages, msg],
				input,
			}),
		});

		if (!res.ok) {
			console.error("Error:", res.statusText);
		} else {
			const airesponse = await res.text();
			setIsSpeaking(true);
			Speech.speak(airesponse, {
				voice: "en-us-x-tpd-local",
				onDone: () => {
					setIsSpeaking(false);
					handleStart();
				},
				onStopped: () => {
					setIsSpeaking(false);
				},
				onError: () => {
					setIsSpeaking(false);
					handleStart();
				},
			});
			const aimsg: any = await addMessage(db, id, airesponse, "assistant");
			setMessages((prev) => [...prev, aimsg]);
		}
	}

	useEffect(() => {
		async function checkIfExists() {
			const exists = await getConversation(db, id);
			if (exists) {
				setMessages(exists.messages);
			}
		}
		checkIfExists();
		// Automatically start listening when the screen loads
		// and not already speaking (e.g. if TTS was triggered by a deep link with initial prompt)
		// if (!isSpeaking) {
		// 	handleStart();
		// }

		async function cleanup() {
			if (recognizing) ExpoSpeechRecognitionModule.abort();
			if (await Speech.isSpeakingAsync()) await Speech.stop();
		}

		return () => {
			cleanup();
		};
	}, []);

	return (
		<View style={{ flex: 1, alignItems: "center", backgroundColor: "#fcf5f2" }}>
			<ImageBackground
				source={require("../../assets/images/bg-4.png")}
				style={[StyleSheet.absoluteFill]}
				contentFit="cover"
			/>

			<SafeAreaView
				style={{
					flex: 1,
					justifyContent: "flex-end",
					alignItems: "center",
					paddingVertical: 16,
					paddingHorizontal: 20,
					paddingBottom: 48,
					gap: 24,
					// backgroundColor: "#000",
					width: "100%",
				}}
			>
				<Text
					style={{ fontFamily: "Geist", fontSize: 16, textAlign: "center" }}
				>
					{recognizing ? "Listening..." : "Ask anything"}
				</Text>
				<View
					style={{
						flexDirection: "row",
						gap: 16,
						alignItems: "center",
						justifyContent: "center",
						width: "100%",
						// backgroundColor: "#000",
					}}
				>
					<AnimatedPressable
						key={"mic-button"}
						layout={CustomTransition}
						style={{
							backgroundColor: "rgba(255, 255, 255, 0.3)",
							borderRadius: 9999,
							boxShadow: recognizing ? "0 0 0 3px #89b4fa" : "none",
							width: 64,
							height: 64,
							justifyContent: "center",
							alignItems: "center",
						}}
						onPress={() => {
							if (recognizing) {
								ExpoSpeechRecognitionModule.stop();
							} else {
								handleStart();
							}
						}}
					>
						<MicrophoneIcon
							strokeWidth={2}
							width={32}
							height={32}
							color="#444"
						/>
					</AnimatedPressable>

					{isSpeaking && (
						<AnimatedPressable
							key={"stop-button"}
							entering={FadeInDown}
							layout={CustomTransition}
							style={{
								padding: 16,
								backgroundColor: "rgba(255, 255, 255, 0.3)",
								borderRadius: 9999,
								width: 64,
								height: 64,
								justifyContent: "center",
								alignItems: "center",
								transformOrigin: "bottom",
							}}
							onPress={async () => {
								await Speech.stop();
								handleStart();
							}}
						>
							<SpeakerXMarkIcon
								strokeWidth={2}
								width={32}
								height={32}
								color="#444"
							/>
						</AnimatedPressable>
					)}

					<AnimatedPressable
						key={"close-button"}
						layout={CustomTransition}
						style={{
							padding: 16,
							backgroundColor: "rgba(255, 255, 255, 0.3)",
							borderRadius: 9999,
							width: 64,
							height: 64,
							justifyContent: "center",
							alignItems: "center",
						}}
						onPress={() => {
							if (messages.length) router.replace(`/chat/${id}`);
							else router.replace("/");
						}}
					>
						<XMarkIcon strokeWidth={2} width={32} height={32} color="#444" />
					</AnimatedPressable>
				</View>

				<View
					style={{
						position: "absolute",
						bottom: 0,
						alignSelf: "center",
						flexDirection: "row",
						filter: "blur(20px)",
						opacity: 0.5,
						// backgroundColor: "#000",
						width: "90%",
						height: 250,
						justifyContent: "center",
						alignItems: "center",
						overflow: "hidden",
						isolation: "isolate",
						borderBottomLeftRadius: 100,
						borderBottomRightRadius: 100,
						borderRadius: 100,
						zIndex: -1,
					}}
				>
					<Animated.View
						style={[
							{
								width: 200,
								height: 150,
								backgroundColor: "#e8aeb7",
								borderRadius: 9999,
								position: "absolute",
								transform: "scale(1) translateY(0) translateX(0)",
								opacity: 0.25,
								mixBlendMode: "multiply",
								// right: 150,
							},
							circ1Styles,
						]}
					/>
					<Animated.View
						style={[
							{
								width: 200,
								height: 150,
								backgroundColor: "#fab387",
								borderRadius: 9999,
								position: "absolute",
								transform: "scale(1) translateY(0) translateX(0)",
								opacity: 0.25,
								mixBlendMode: "multiply",
								right: 150,
							},
							circ2Styles,
						]}
					/>
					<Animated.View
						style={[
							{
								width: 200,
								height: 150,
								backgroundColor: "#f2cdcd",
								borderRadius: 9999,
								position: "absolute",
								transform: "scale(1) translateY(0) translateX(0)",
								opacity: 0.25,
								mixBlendMode: "multiply",
								left: 150,
							},
							circ3Styles,
						]}
					/>
				</View>
			</SafeAreaView>
		</View>
	);
}
