import { Image, ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import {
	ExpoSpeechRecognitionModule,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Voice() {
	const router = useRouter();
	const [recognizing, setRecognizing] = useState(false);
	const [transcript, setTranscript] = useState("");

	useSpeechRecognitionEvent("start", () => setRecognizing(true));
	useSpeechRecognitionEvent("end", () => setRecognizing(false));
	useSpeechRecognitionEvent("result", (event) => {
		setTranscript(event.results[0]?.transcript);
	});
	useSpeechRecognitionEvent("error", (event) => {
		console.log("error code:", event.error, "error message:", event.message);
	});

	const handleStart = async () => {
		const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
		if (!result.granted) {
			console.warn("Permissions not granted", result);
			return;
		}
		// Start speech recognition
		ExpoSpeechRecognitionModule.start({
			lang: "en-US",
			interimResults: true,
			continuous: false,
		});
	};

	return (
		<View style={{ flex: 1, alignItems: "center" }}>
			<ImageBackground
				source={require("../../assets/images/bg-4.png")}
				style={[
					StyleSheet.absoluteFill,
					{
						backgroundColor: "#fcf5f2",
					},
				]}
				contentFit="cover"
			/>

			{/* <Pressable
				style={{
					position: "absolute",
					top: 80,
					flexDirection: "row",
					alignItems: "center",
					borderColor: "#999",
					borderWidth: 1,
					paddingVertical: 8,
					paddingHorizontal: 20,
					borderRadius: 9999,
					marginHorizontal: "auto",
				}}
				onPress={() => router.back()}
			>
				<XMarkIcon width={22} height={22} stroke={"#666"} />
				<Text
					style={{
						fontFamily: "Geist",
						fontSize: 16,
						fontWeight: "700",
						color: "#666",
						marginLeft: 4,
					}}
				>
					Close Chat
				</Text>
			</Pressable> */}

			<SafeAreaView
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					paddingVertical: 16,
					paddingHorizontal: 20,
				}}
			>
				<Image
					style={{
						width: 256,
						height: 256,
						borderRadius: 9999,
					}}
					contentFit="cover"
					transition={300}
					source={require("../../assets/images/gradi3.png")}
				/>
				<Text
					style={{
						fontFamily: "PlayfairDisplay",
						fontSize: 32,
						textAlign: "center",
						marginTop: 16,
						color: "#333",
					}}
				>
					Speak your thoughts
				</Text>
				{!recognizing ? (
					<Button title="Start" onPress={handleStart} />
				) : (
					<Button
						title="Stop"
						onPress={() => ExpoSpeechRecognitionModule.stop()}
					/>
				)}

				<ScrollView>
					<Text>{transcript}</Text>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}
