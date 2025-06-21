import "@/utils/polyfills";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		// <StrictMode>
		<KeyboardProvider>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack
					screenOptions={{
						headerShown: false,
						animation: "ios_from_right",
					}}
				>
					<Stack.Screen singular name="index" />
					<Stack.Screen
						options={{
							animation: "ios_from_left",
						}}
						name="library"
					/>
					<Stack.Screen
						options={{
							animation: "ios_from_left",
						}}
						name="diary/index"
					/>
					<Stack.Screen name="chat/[id]" singular />
					<Stack.Screen
						options={{ animation: "fade_from_bottom" }}
						name="voice/[id]"
						singular
					/>
					<Stack.Screen name="+not-found" />
				</Stack>
				<StatusBar style="dark" translucent animated />
			</ThemeProvider>
		</KeyboardProvider>
		// </StrictMode>
	);
}
