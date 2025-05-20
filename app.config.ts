import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	slug: config?.slug || "dear_ai",
	name: config?.name || "Dear AI",
	plugins: [
		...(config?.plugins || []),
		[
			"expo-font",
			{
				fonts: [
					"./assets/fonts/Geist.ttf",
					"./assets/fonts/PlayfairDisplay.ttf",
				],
				android: {
					fonts: [
						{
							fontFamily: "Geist",
							fontDefinations: [
								100, 200, 300, 400, 500, 600, 700, 800, 900,
							].map((weight) => ({
								path: "./assets/fonts/Geist.ttf",
								weight: weight,
							})),
						},
						{
							fontFamily: "PlayfairDisplay",
							fontDefinations: [400, 500, 600, 700, 800, 900].map((weight) => ({
								path: "./assets/fonts/PlayfairDisplay.ttf",
								weight: weight,
							})),
						},
					],
				},
			},
		],
	],
});
