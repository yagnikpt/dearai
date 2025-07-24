import { fetch } from "expo/fetch";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import {
	ExpoSpeechRecognitionModule,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useRef, useState } from "react"; // Added useRef
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
	ChatBubbleBottomCenterTextIcon,
	MicrophoneIcon,
	SpeakerXMarkIcon,
	XMarkIcon,
} from "react-native-heroicons/outline";
import Animated, {
	FadeInDown,
	LinearTransition,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import EventSource from "react-native-sse";
import {
	addMessage,
	createChat,
	generateTitle,
	getConversation,
} from "@/lib/data/chats";
import type { Message } from "@/types";
import { generateAPIUrl } from "@/utils";
import { Colors } from "@/utils/constants/Colors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CustomTransition = LinearTransition.springify()
	.damping(10)
	.stiffness(150)
	.overshootClamping(1);

const SENTENCE_SPLIT_REGEX = /(.+?[.!?\n])/g;
// Fallback: if no punctuation, after how many words to attempt a split
const MAX_WORDS_PER_CHUNK_FALLBACK = 25;
// Timeout for flushing buffer if no sentence end found
const BUFFER_FLUSH_TIMEOUT_MS = 2500; // 2.5 seconds

export default function Voice() {
	const { id, new: newParam } = useLocalSearchParams<{
		id: string;
		new?: string;
	}>();
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>([]);
	const [recognizing, setRecognizing] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [isSpeaking, setIsSpeaking] = useState(false);

	const [currentUtterance, setCurrentUtterance] = useState("");
	const [fullTranscript, setFullTranscript] = useState(""); // To see what's been "sent"

	// useRef for mutable values that don't trigger re-renders on change
	const textBufferRef = useRef(""); // Accumulates incoming text
	const sentenceQueueRef = useRef<string[]>([]); // Queue of sentences to speak
	const flushTimeoutRef = useRef<NodeJS.Timeout>(null); // Timeout for flushing buffer

	const translateXCirc1 = useSharedValue(0);
	const translateYCirc1 = useSharedValue(20);
	const scaleCirc1 = useSharedValue(1);
	const opacityCirc1 = useSharedValue(0.25);
	const translateXCirc2 = useSharedValue(0);
	const translateYCirc2 = useSharedValue(20);
	const scaleCirc2 = useSharedValue(1);
	const opacityCirc2 = useSharedValue(0.25);
	const translateXCirc3 = useSharedValue(0);
	const translateYCirc3 = useSharedValue(20);
	const scaleCirc3 = useSharedValue(1);
	const opacityCirc3 = useSharedValue(0.25);

	useEffect(() => {
		let interval: NodeJS.Timeout;

		function getRandomXY() {
			const randomX = Math.floor(Math.random() * 101) - 50;
			// const randomY = Math.floor(Math.random() * 41) - 20;
			const randomY = 20;
			return { randomX, randomY };
		}

		const DURATION = 2000;

		function animateCircs(initial = false) {
			const { randomX: rx1, randomY: ry1 } = getRandomXY();
			const { randomX: rx2, randomY: ry2 } = getRandomXY();
			const { randomX: rx3, randomY: ry3 } = getRandomXY();
			if (!initial) {
				translateXCirc1.value = withTiming(rx1, {
					duration: DURATION,
				});
				translateYCirc1.value = withTiming(ry1, {
					duration: DURATION,
				});
				translateXCirc2.value = withTiming(rx2, {
					duration: DURATION,
				});
				translateYCirc2.value = withTiming(ry2, {
					duration: DURATION,
				});
				translateXCirc3.value = withTiming(rx3, {
					duration: DURATION,
				});
				translateYCirc3.value = withTiming(ry3, {
					duration: DURATION,
				});
			} else {
				scaleCirc1.value = withTiming(1.75, {
					duration: DURATION - 800,
				});
				opacityCirc1.value = withTiming(1, {
					duration: DURATION - 800,
				});
				scaleCirc2.value = withTiming(1.75, {
					duration: DURATION - 800,
				});
				opacityCirc2.value = withTiming(1, {
					duration: DURATION - 800,
				});
				scaleCirc3.value = withTiming(1.75, {
					duration: DURATION - 800,
				});
				opacityCirc3.value = withTiming(1, {
					duration: DURATION - 800,
				});
			}
		}

		animateCircs(true);
		interval = setInterval(animateCircs, DURATION + 100);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const circ1Styles = useAnimatedStyle(() => ({
		transform: [
			{ translateX: `${translateXCirc1.value}%` },
			{ translateY: `${translateYCirc1.value}%` },
			{ scale: scaleCirc1.value },
		],
		opacity: opacityCirc1.value,
	}));

	const circ2Styles = useAnimatedStyle(() => ({
		transform: [
			{ translateX: `${translateXCirc2.value}%` },
			{ translateY: `${translateYCirc2.value}%` },
			{ scale: scaleCirc2.value },
		],
		opacity: opacityCirc2.value,
	}));

	const circ3Styles = useAnimatedStyle(() => ({
		transform: [
			{ translateX: `${translateXCirc3.value}%` },
			{ translateY: `${translateYCirc3.value}%` },
			{ scale: scaleCirc3.value },
		],
		opacity: opacityCirc3.value,
	}));

	useSpeechRecognitionEvent("start", () => setRecognizing(true));
	useSpeechRecognitionEvent("end", () => setRecognizing(false));
	useSpeechRecognitionEvent("result", async (event) => {
		setTranscript(event.results[0]?.transcript);
		if (event.isFinal) {
			await handleSubmit(event.results[0]?.transcript ?? "");
		}
	});

	const speakNextInQueue = useCallback(async () => {
		if (isSpeaking || sentenceQueueRef.current.length === 0) {
			return;
		}

		const sentenceToSpeak = sentenceQueueRef.current.shift(); // Get and remove first item
		// console.log("Next sentence to speak:", sentenceToSpeak);

		if (sentenceToSpeak && sentenceToSpeak.trim() !== "") {
			setIsSpeaking(true);
			setCurrentUtterance(sentenceToSpeak);
			// console.log("Speaking:", sentenceToSpeak);
			Speech.speak(sentenceToSpeak, {
				// language: 'en-US', // Optional: specify language
				voice: "en-us-x-tpd-local",
				onDone: () => {
					// console.log("Done speaking:", sentenceToSpeak);
					setIsSpeaking(false);
					// speakNextInQueue(); // Will be triggered by useEffect watching isSpeaking
				},
				onError: (error) => {
					console.error("Speech error:", error);
					setIsSpeaking(false);
					// speakNextInQueue(); // Also try to continue on error
				},
			});
		} else if (sentenceQueueRef.current.length > 0) {
			// If the shifted sentence was empty, try the next one immediately
			speakNextInQueue();
		}
	}, [isSpeaking]); // Recreate if isSpeaking changes (though it's mainly for the initial call)

	// --- Text Processing & Buffering ---
	const processTextBuffer = useCallback(
		(isStreamEnding = false) => {
			let newSentencesFound = false;
			const buffer = textBufferRef.current;
			// console.log("Processing text buffer:", buffer);

			// Try to find sentences using regex
			let match;
			const matches = [];
			let lastIndex = 0;
			while ((match = SENTENCE_SPLIT_REGEX.exec(buffer)) !== null) {
				// console.log("Last index:", SENTENCE_SPLIT_REGEX.lastIndex);
				lastIndex = SENTENCE_SPLIT_REGEX.lastIndex;
				matches.push(match[1].trim());
			}
			// console.log("Matches found:", matches);

			if (matches.length > 0) {
				matches.forEach((sentence) => {
					if (sentence) {
						sentenceQueueRef.current.push(sentence);
						newSentencesFound = true;
					}
				});
				// Update buffer to what's left after the last full match
				textBufferRef.current = buffer.substring(lastIndex);
				SENTENCE_SPLIT_REGEX.lastIndex = 0; // Reset regex state
			}

			// If stream is ending, any remaining buffer is a sentence
			if (isStreamEnding && textBufferRef.current.trim() !== "") {
				sentenceQueueRef.current.push(textBufferRef.current.trim());
				textBufferRef.current = "";
				newSentencesFound = true;
			}
			// Fallback: if buffer is long and no sentence end, split by word count
			// This is a simpler fallback, could be more sophisticated
			else if (
				!newSentencesFound &&
				!isStreamEnding &&
				textBufferRef.current.trim().split(/\s+/).length >
					MAX_WORDS_PER_CHUNK_FALLBACK
			) {
				const words = textBufferRef.current.trim().split(/\s+/);
				const chunk = words.slice(0, MAX_WORDS_PER_CHUNK_FALLBACK).join(" ");
				sentenceQueueRef.current.push(chunk);
				textBufferRef.current = words
					.slice(MAX_WORDS_PER_CHUNK_FALLBACK)
					.join(" ");
				newSentencesFound = true;
			}

			if (newSentencesFound) {
				clearTimeout(flushTimeoutRef.current ?? undefined); // Clear existing flush timeout
				flushTimeoutRef.current = null;
				speakNextInQueue(); // Attempt to speak if not already
			} else if (
				textBufferRef.current.length > 0 &&
				!isStreamEnding &&
				!flushTimeoutRef.current
			) {
				// If there's text in buffer but no sentence found, set a timeout to flush it
				flushTimeoutRef.current = setTimeout(() => {
					if (textBufferRef.current.trim() !== "") {
						// console.log(
						// 	"Flushing buffer due to timeout:",
						// 	textBufferRef.current.trim(),
						// );
						sentenceQueueRef.current.push(textBufferRef.current.trim());
						textBufferRef.current = "";
						speakNextInQueue();
					}
					flushTimeoutRef.current = null;
				}, BUFFER_FLUSH_TIMEOUT_MS);
			}
		},
		[speakNextInQueue],
	);

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

		if (messages.length === 0) {
			await createChat(id, input ?? "New Voice Chat");
			generateTitle(id, input ?? "New Voice Chat");
		}

		const msg: any = await addMessage(id, input, "user");
		setMessages((prev) => [...prev, msg]);
		setTranscript("");

		const resp = await fetch(generateAPIUrl("/api/customchat"), {
			headers: {
				"Content-Type": "application/json",
				Accept: "text/event-stream",
			},
			method: "POST",
			body: JSON.stringify({
				messages: messages.slice(0, -1),
				input,
			}),
		});
		if (!resp.ok || !resp.body) {
			console.error("Failed to connect to SSE endpoint:", resp.statusText);
			return;
		}
		let result = "";
		const reader = resp.body.getReader();
		const decoder = new TextDecoder();

		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			const chunk = decoder.decode(value, { stream: true });
			handleReceiveTextChunk(chunk);
			result += chunk;
		}
		result += decoder.decode();
		handleEndOfStream();
		const aimsg: any = await addMessage(id, result, "assistant");
		setMessages((prev) => [...prev, aimsg]);
	}

	// Effect to process speech queue when not speaking and queue has items
	useEffect(() => {
		if (!isSpeaking && sentenceQueueRef.current.length > 0) {
			speakNextInQueue();
			setIsSpeaking(true);
		}
	}, [isSpeaking, speakNextInQueue, sentenceQueueRef.current.length]); // Re-run if isSpeaking changes or queue length changes (indirectly)

	// Function to simulate receiving a chunk of text from a stream
	function handleReceiveTextChunk(chunk: string) {
		if (!chunk) return;
		textBufferRef.current += chunk;
		setFullTranscript((prev) => prev + chunk); // Update full transcript for display
		processTextBuffer();
		// console.log("Current text buffer:", textBufferRef.current);
		// console.log("Current sentence queue:", sentenceQueueRef.current);
	}

	// Function to signal the end of the stream
	function handleEndOfStream() {
		// console.log("End of stream signaled.");
		processTextBuffer(true); // Process remaining buffer as final
		// The speakNextInQueue will handle speaking the rest.
	}

	const stopSpeaking = async () => {
		await Speech.stop();
		setIsSpeaking(false);
		sentenceQueueRef.current = []; // Clear the queue
		textBufferRef.current = ""; // Clear the buffer
		setCurrentUtterance("");
		if (flushTimeoutRef.current) {
			clearTimeout(flushTimeoutRef.current);
			flushTimeoutRef.current = null;
		}
		handleStart();
		// console.log("Speech stopped and queue cleared.");
	};

	useEffect(() => {
		async function checkIfExists() {
			const exists = await getConversation(id);
			if (exists) {
				setMessages(exists.messages);
			}
		}
		checkIfExists();
		// Automatically start listening when the screen loads
		// and not already speaking (e.g. if TTS was triggered by a deep link with initial prompt)
		if (!isSpeaking) {
			handleStart();
		}

		async function cleanup() {
			ExpoSpeechRecognitionModule.abort();
			if (await Speech.isSpeakingAsync()) await Speech.stop();
		}

		return () => {
			cleanup();
		};
	}, []);

	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				backgroundColor: Colors.light.background,
			}}
		>
			<LinearGradient
				colors={[Colors.light.background, Colors.light.tintAlt]}
				style={StyleSheet.absoluteFill}
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
							boxShadow: recognizing
								? `0 0 0 3px ${Colors.light.tint}`
								: "none",
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

					{(isSpeaking || sentenceQueueRef.current.length > 0) && (
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
							onPress={stopSpeaking}
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
							if (newParam && messages.length) router.replace(`/chat/${id}`);
							else router.back();
						}}
					>
						<XMarkIcon strokeWidth={2} width={32} height={32} color="#444" />
					</AnimatedPressable>

					{!newParam && (
						<AnimatedPressable
							key={"chat-redirect-button"}
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
							onPress={() => router.replace(`/chat/${id}`)}
						>
							<ChatBubbleBottomCenterTextIcon
								strokeWidth={2}
								width={32}
								height={32}
								color="#444"
							/>
						</AnimatedPressable>
					)}
				</View>

				<View
					style={{
						position: "absolute",
						bottom: 0,
						alignSelf: "center",
						flexDirection: "row",
						filter: "blur(20px)",
						opacity: 0.4,
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
