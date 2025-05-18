import { Colors } from "@/constants/Colors";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const Spinner = ({ size = "large" }: { size?: "small" | "large" | number }) => {
	return (
		<View style={styles.container}>
			<ActivityIndicator size={size} color={Colors.light.tint} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default Spinner;
