import { useGradualAnimation } from "@/hooks/useGradualAnimation";
import {
	deleteChat,
	getAllConversations,
	renameChat,
} from "@/tools/chat-store";
import type { Conversation } from "@/types";
import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite"; // Added import
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	// SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	ChatBubbleOvalLeftEllipsisIcon,
	ChevronDoubleRightIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "react-native-heroicons/outline";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
	const [current, setCurrent] = useState<string | null>(null);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [showFiltered, setShowFiltered] = useState(false);
	const router = useRouter();
	const db = useSQLiteContext();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const renameSheetRef = useRef<BottomSheetModal>(null);
	const { height } = useGradualAnimation();

	const keyboardPadding = useAnimatedStyle(() => {
		return {
			height: height.value,
		};
	}, []);

	async function fetchConversations() {
		try {
			setLoading(true);
			const convos = await getAllConversations(db);
			setConversations(convos as Conversation[]);
		} catch (error) {
			console.error("Error fetching conversations:", error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchConversations();
	}, []);

	const handlePressConversation = (id: string) => {
		router.push(`/chat/${id}`);
	};

	const handleDeleteChat = async (id: string) => {
		try {
			await deleteChat(db, id);
			setConversations((prevConversations) =>
				prevConversations.filter((convo) => convo.id !== id),
			);
		} catch (error) {
			console.error("Error deleting conversation:", error);
			Alert.alert("Error", "Could not delete the chat. Please try again.");
		}
	};

	const handlePresentPress = useCallback((id: string) => {
		setCurrent(id);
		bottomSheetRef.current?.present();
	}, []);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior={"close"}
			/>
		),
		[],
	);

	const handleRenameChat = async (id: string, newTitle: string) => {
		try {
			await renameChat(db, id, newTitle);
			setConversations((prevConversations) =>
				prevConversations.map((convo) =>
					convo.id === id ? { ...convo, title: newTitle } : convo,
				),
			);
		} catch (error) {
			console.error("Error renaming conversation:", error);
			Alert.alert("Error", "Could not delete the chat. Please try again.");
		} finally {
			renameSheetRef.current?.close();
			bottomSheetRef.current?.close();
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		try {
			return format(new Date(dateString), "MMM dd, yyyy");
		} catch (e) {
			return dateString;
		}
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={styles.loadingIndicator.color} />
				<Text style={styles.loadingText}>Loading Chats...</Text>
			</SafeAreaView>
		);
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={styles.safeArea}>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
						paddingVertical: 6,
						borderBottomWidth: 1,
						paddingHorizontal: 12,
						paddingRight: 16,
						borderBottomColor: "#ddd",
					}}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							backgroundColor: "#dedede",
							borderRadius: 999,
							paddingHorizontal: 12,
							paddingVertical: 4,
							gap: 8,
							flex: 1,
						}}
					>
						<MagnifyingGlassIcon
							strokeWidth={2}
							color="#666"
							width={24}
							height={24}
						/>
						<TextInput
							style={{
								fontSize: 16,
								color: "#222",
								flex: 1,
								fontFamily: "Geist",
							}}
							inputMode="search"
							placeholder="Search chat history"
							placeholderTextColor="#999"
							value={search}
							onChangeText={(text) => {
								setSearch(text);
							}}
							onSubmitEditing={(e) => {
								if (e.nativeEvent.text !== "") setShowFiltered(true);
							}}
						/>
						{!!search && (
							<Pressable
								style={{ marginLeft: 8 }}
								onPress={() => {
									setShowFiltered(false);
									setSearch("");
								}}
							>
								<XMarkIcon
									strokeWidth={2}
									color="#666"
									width={24}
									height={24}
								/>
							</Pressable>
						)}
					</View>
					<Pressable style={{ marginLeft: 8 }} onPress={() => router.back()}>
						<ChevronDoubleRightIcon color="#555" width={28} height={28} />
					</Pressable>
				</View>
				<BottomSheetModalProvider>
					{conversations.length === 0 && !loading ? (
						<View style={styles.emptyContainer}>
							<ChatBubbleOvalLeftEllipsisIcon
								width={80}
								height={80}
								color={styles.emptyIcon.color}
							/>
							<Text style={styles.emptyText}>No chats yet.</Text>
							<Text style={styles.emptySubText}>
								Start a new conversation from the home screen!
							</Text>
							<Pressable
								onPress={() => router.back()}
								style={styles.homeButton}
							>
								<Text style={styles.homeButtonText}>Go to Home</Text>
							</Pressable>
						</View>
					) : (
						<ScrollView contentContainerStyle={styles.scrollViewContent}>
							<Text
								style={{
									fontSize: 15,
									fontFamily: "Geist",
									paddingHorizontal: -12,
									marginBottom: 8,
									color: "#2c3e50",
								}}
							>
								Conversations
							</Text>
							{conversations
								.filter((convo) =>
									showFiltered
										? convo.title?.toLowerCase().includes(search.toLowerCase())
										: true,
								)
								.map((convo) => (
									<Pressable
										key={convo.id}
										style={styles.conversationItem}
										onPress={() => handlePressConversation(convo.id)}
										onLongPress={() => handlePresentPress(convo.id)}
									>
										<View style={styles.conversationDetails}>
											<Text style={styles.conversationTitle}>
												{convo.title?.trim() ||
													`Chat from ${formatDate(convo.start_time)}`}
											</Text>
											<Text style={styles.conversationDate}>
												{formatDate(convo.start_time)}
											</Text>
										</View>
									</Pressable>
								))}
						</ScrollView>
					)}
				</BottomSheetModalProvider>

				<BottomSheetModalProvider>
					<BottomSheetModal
						ref={bottomSheetRef}
						key="ActionsSheet"
						name="ActionsSheet"
						snapPoints={["20%"]}
						enableDynamicSizing={false}
						backdropComponent={renderBackdrop}
					>
						<BottomSheetView style={{ gap: 20, paddingTop: 20 }}>
							<Pressable
								style={{ paddingHorizontal: 20 }}
								onPress={() => {
									renameSheetRef.current?.present();
								}}
							>
								<Text
									style={{
										fontSize: 18,
										color: "#2c3e50",
										fontFamily: "Geist",
									}}
								>
									Rename
								</Text>
							</Pressable>
							<Pressable
								style={{ paddingHorizontal: 20 }}
								onPress={async () => {
									if (current) await handleDeleteChat(current);
									bottomSheetRef.current?.close();
								}}
							>
								<Text
									style={{
										fontSize: 18,
										color: "#e74c3c",
										fontFamily: "Geist",
									}}
								>
									Delete Chat
								</Text>
							</Pressable>
						</BottomSheetView>
					</BottomSheetModal>

					<BottomSheetModal
						stackBehavior="replace"
						ref={renameSheetRef}
						key="RenameSheet"
						name="RenameSheet"
						snapPoints={["25%"]}
						enableDynamicSizing={false}
						backdropComponent={renderBackdrop}
						// onDismiss={handleDismiss}
					>
						<BottomSheetView style={{ gap: 20, padding: 20 }}>
							<TextInput
								style={{
									borderWidth: 1,
									borderColor: "#ccc",
									borderRadius: 8,
									padding: 10,
									fontSize: 16,
									fontFamily: "Geist",
								}}
								defaultValue={
									current
										? conversations.find((p) => p.id === current)?.title || ""
										: ""
								}
								placeholder="Enter new chat name"
								placeholderTextColor="#aaa"
								onSubmitEditing={async (e) => {
									if (current)
										await handleRenameChat(current, e.nativeEvent.text);
								}}
								autoFocus
							/>
						</BottomSheetView>
					</BottomSheetModal>
				</BottomSheetModalProvider>
			</SafeAreaView>
			<Animated.View style={keyboardPadding} />
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		// paddingTop: 10,
		backgroundColor: "#fcf5f2",
		// paddingHorizontal: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fcf5f2",
	},
	loadingIndicator: {
		color: "#7f8c8d",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 18,
		fontFamily: "Geist",
		color: "#34495e",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	emptyIcon: {
		color: "#95a5a6", // Medium gray for icon
	},
	emptyText: {
		fontSize: 22,
		fontFamily: "PlayfairDisplay",
		color: "#7f8c8d", // Medium dark gray for light mode
		marginTop: 20,
		marginBottom: 10,
		textAlign: "center",
	},
	emptySubText: {
		fontSize: 16,
		fontFamily: "Geist",
		color: "#95a5a6", // Medium gray for light mode
		textAlign: "center",
		marginBottom: 20,
	},
	homeButton: {
		backgroundColor: "#e0e0e0", // Slightly darker button for light mode if needed
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
		marginTop: 10,
	},
	homeButtonText: {
		color: "#2c3e50", // Dark text, should be fine
		fontFamily: "Geist",
		fontSize: 16,
		fontWeight: "bold",
	},
	scrollViewContent: {
		paddingHorizontal: 20,
		paddingVertical: 5,
		paddingTop: 32,
	},
	conversationItem: {
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 8,
		marginBottom: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	conversationDetails: {
		flex: 1,
	},
	conversationTitle: {
		fontSize: 18,
		fontFamily: "Geist",
		color: "#34495e",
		marginBottom: 4,
		// backgroundColor: "#000",
	},
	conversationDate: {
		fontSize: 12,
		fontFamily: "Geist",
		color: "#7f8c8d",
	},
});
