import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/utils/constants/Colors";

export default function DiaryPage() {
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
				}}
			>
				Diary (June)
			</Text>
			<View
				style={{
					flex: 1,
					flexDirection: "row",
					justifyContent: "center",
					flexWrap: "wrap",
					gap: 8,
					marginTop: 16,
				}}
			>
				{Array.from({ length: 30 }, (_, i) => (
					<View
						key={i}
						style={{
							minWidth: "20%",
							maxWidth: "22%",
							aspectRatio: 1,
							backgroundColor: Colors.light.tintAlt,
							borderRadius: 8,
						}}
					>
						<Text
							style={{
								flex: 1,
								textAlign: "center",
								fontFamily: "PlayfairDisplay",
								verticalAlign: "middle",
								fontSize: 24,
							}}
						>
							{i + 1}
						</Text>
					</View>
				))}
			</View>
		</SafeAreaView>
	);
}
