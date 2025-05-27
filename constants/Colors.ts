/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#f5e4e4";
const tintColorDark = "#fff";

export const Colors = {
	light: {
		text: "#11181C",
		background: "#fcf5f2",
		tint: tintColorLight,
		icon: "#222",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,
		shadow: "rgba(255, 221, 216, 0.25)",
	},
	dark: {
		text: "#ECEDEE",
		background: "#151718",
		tint: tintColorDark,
		icon: "#9BA1A6",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: tintColorDark,
		shadow: "rgba(255, 221, 216, 0.25)",
	},
};
