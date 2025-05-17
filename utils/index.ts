import Constants from "expo-constants";

export const generateAPIUrl = (relativePath: string) => {
	const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

	if (process.env.NODE_ENV === "development") {
		let devServerHttpUrl = "";

		if (Constants.experienceUrl) {
			devServerHttpUrl = Constants.experienceUrl.replace("exp://", "http://");
			console.log(
				`[generateAPIUrl] Using experienceUrl for API base: ${devServerHttpUrl}`,
			);
		} else if (Constants.expoConfig?.hostUri) {
			devServerHttpUrl = `http://${Constants.expoConfig.hostUri}`;
		}

		if (devServerHttpUrl) {
			return devServerHttpUrl.concat(path);
		}

		const errorMessage =
			`[generateAPIUrl] CRITICAL: Could not determine development server URL. ` +
			`Constants.experienceUrl and Constants.expoConfig.hostUri are undefined. ` +
			`(execution environment: ${Constants.executionEnvironment}). ` +
			"This will prevent API calls from working on a physical device. " +
			"Ensure your development client (on your physical device) is properly connected to the Metro bundler running on your machine. " +
			"Usually, this involves scanning the QR code from the Metro bundler output in the Expo Dev Menu on your device, or ensuring both are on the same Wi-Fi network. " +
			"The Metro bundler terminal output should display the correct IP address to connect to.";
		throw new Error(errorMessage);
	}

	if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
		throw new Error(
			"EXPO_PUBLIC_API_BASE_URL environment variable is not defined for the current environment.",
		);
	}

	return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};
