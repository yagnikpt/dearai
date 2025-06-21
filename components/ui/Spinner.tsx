import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/utils/constants/Colors";

const Spinner = ({
	size = "large",
	label,
}: {
	size?: "small" | "large" | number;
	label?: string;
}) => {
	return (
		<View style={styles.container}>
			<ActivityIndicator size={size} color={Colors.light.icon} />
			{label && <Text style={styles.label}>{label}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 12,
	},
	label: {
		color: Colors.light.text,
		fontSize: 18,
		fontFamily: "Geist",
	},
});

export default Spinner;
