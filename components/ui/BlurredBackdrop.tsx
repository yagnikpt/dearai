import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const BlurredBackdrop = (props: BottomSheetBackdropProps) => {
	const { animatedIndex, style } = props;

	const containerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			animatedIndex.value,
			[-1, 0],
			[0, 1],
			Extrapolation.CLAMP,
		),
	}));

	const containerStyle = useMemo(
		() => [
			style,
			containerAnimatedStyle,
			StyleSheet.absoluteFill,
			{ backgroundColor: "rgba(0, 0, 0, 0.1)" },
		],
		[style, containerAnimatedStyle],
	);

	return (
		<AnimatedBlurView
			intensity={10}
			tint="regular"
			experimentalBlurMethod="dimezisBlurView"
			style={containerStyle}
		/>
	);
};

export default BlurredBackdrop;
