import { useColorScheme } from "@/hooks/useColorScheme";
import "@/utils/polyfills";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import type * as SQLite from "expo-sqlite";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

async function initializeDatabaseSchema(db: SQLite.SQLiteDatabase) {
	await db.execAsync(`
		CREATE TABLE IF NOT EXISTS conversations (
			id TEXT PRIMARY KEY,
			start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			end_time DATETIME,
			title VARCHAR(255),
			status TEXT DEFAULT 'active' CHECK(status IN ('active', 'ended', 'archived')),
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE INDEX IF NOT EXISTS idx_start_time ON conversations (start_time);

		CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			conversation_id TEXT NOT NULL,
			role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system', 'data')),
			content TEXT NOT NULL,
			type TEXT DEFAULT 'text' CHECK(type IN ('text', 'image', 'file', 'code')),
			metadata JSON,
			sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			parent_message_id TEXT,
			is_edited BOOLEAN DEFAULT FALSE,
			edited_at DATETIME,
			FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
			FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL
		);

		CREATE INDEX IF NOT EXISTS idx_conversation_id ON messages (conversation_id);
	  CREATE INDEX IF NOT EXISTS idx_sent_at ON messages (sent_at);

		CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at
		AFTER UPDATE ON conversations
		FOR EACH ROW
		BEGIN
			UPDATE conversations
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;
	`);
	// await db.execAsync(`
	// 	DROP TABLE IF EXISTS conversations;
	// 	DROP TABLE IF EXISTS messages;
	// 	DROP INDEX IF EXISTS idx_start_time;
	// 	DROP INDEX IF EXISTS idx_conversation_id;
	// 	DROP INDEX IF EXISTS idx_sent_at;
	// 	DROP TRIGGER IF EXISTS update_conversations_updated_at;
	// `);
}

export default function RootLayout() {
	const colorScheme = useColorScheme();
	// const [loaded] = useFonts({
	// 	Geist: require("../assets/fonts/Geist.ttf"),
	// 	PlayfairDisplay: require("../assets/fonts/PlayfairDisplay.ttf"),
	// });

	// if (!loaded) {
	// 	return null;
	// }

	return (
		// <StrictMode>
		<KeyboardProvider>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<SQLiteProvider
					databaseName="chat"
					options={{ enableChangeListener: true }}
					onInit={initializeDatabaseSchema}
				>
					<Stack
						screenOptions={{
							headerShown: false,
							contentStyle: { backgroundColor: "#fcf5f2" },
							animation: "ios_from_right",
						}}
					>
						<Stack.Screen name="index" />
						<Stack.Screen
							options={{ animation: "ios_from_left" }}
							name="library"
						/>
						<Stack.Screen name="chat/[id]" />
						<Stack.Screen name="voice/[id]" />
						<Stack.Screen name="+not-found" />
					</Stack>
					<StatusBar style="dark" translucent animated />
				</SQLiteProvider>
			</ThemeProvider>
		</KeyboardProvider>
		// </StrictMode>
	);
}
