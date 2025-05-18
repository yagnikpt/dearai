import ChatBubbleIcon from "@/assets/icons/chat-bubble.svg";
import { deleteChat, getAllConversations } from "@/tools/chat-store";
import type { Conversation } from "@/types";
import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import { Link, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite"; // Added import
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function LibraryScreen() {
	const [current, setCurrent] = useState<string | null>(null);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const db = useSQLiteContext();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

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

	const handleDismiss = useCallback(() => {
		setCurrent(null);
	}, []);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				style={{
					backdropFilter: "blur(3px)",
				}}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior={"close"}
			/>
		),
		[],
	);

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
				<BottomSheetModalProvider>
					<View style={styles.header}>
						<Text style={styles.headerTitle}>Chats</Text>
					</View>
					{conversations.length === 0 && !loading ? (
						<View style={styles.emptyContainer}>
							<ChatBubbleIcon
								width={80}
								height={80}
								color={styles.emptyIcon.color}
							/>
							<Text style={styles.emptyText}>No chats yet.</Text>
							<Text style={styles.emptySubText}>
								Start a new conversation from the home screen!
							</Text>
							<Link href="/" asChild>
								<Pressable style={styles.homeButton}>
									<Text style={styles.homeButtonText}>Go to Home</Text>
								</Pressable>
							</Link>
						</View>
					) : (
						<ScrollView contentContainerStyle={styles.scrollViewContent}>
							{conversations.map((convo) => (
								<Pressable
									key={convo.id}
									style={styles.conversationItem}
									onPress={() => handlePressConversation(convo.id)}
									onLongPress={() => handlePresentPress(convo.id)}
								>
									{/* Icon removed */}
									<View style={styles.conversationDetails}>
										<Text style={styles.conversationTitle}>
											{convo.title ||
												`Chat from ${formatDate(convo.start_time)}`}
										</Text>
										<Text style={styles.conversationDate}>
											{formatDate(convo.start_time)}
										</Text>
										{/* Status removed */}
									</View>
								</Pressable>
							))}
						</ScrollView>
					)}
					<BottomSheetModal
						ref={bottomSheetRef}
						key="PoiDetailsSheet"
						name="PoiDetailsSheet"
						snapPoints={["20%"]}
						enableDynamicSizing={false}
						backdropComponent={renderBackdrop}
						onDismiss={handleDismiss}
					>
						<BottomSheetView style={{ paddingBottom: 50 }}>
							<Pressable
								style={{ padding: 20 }}
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
				</BottomSheetModalProvider>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		paddingTop: 60,
		backgroundColor: "#fcf5f2",
	},
	header: {
		paddingHorizontal: 20,
		paddingBottom: 10,
		paddingTop: 5,
	},
	headerTitle: {
		fontSize: 38,
		fontFamily: "PlayfairDisplay",
		color: "#2c3e50",
		letterSpacing: -0.5,
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
		paddingHorizontal: 15,
		paddingVertical: 5,
	},
	conversationItem: {
		// backgroundColor: "rgba(0, 0, 0, 0.03)", // Very subtle background for items on light mode
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
		fontSize: 17,
		fontWeight: "bold",
		fontFamily: "Geist",
		color: "#34495e", // Darker color for light mode
		marginBottom: 2,
	},
	conversationDate: {
		fontSize: 12,
		fontFamily: "Geist",
		color: "#7f8c8d", // Medium dark gray for light mode
		marginBottom: 0,
	},
});
