# Dear AI 👋

Dear AI is a conversational AI application built with [Expo](https://expo.dev). It's designed to be a supportive companion, ready to listen, chat, or even read you a story. This project leverages the power of Expo to deliver a seamless cross-platform experience.

## Get Started

To get this project up and running on your local machine for development, follow these steps:

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/yagnik-patel-47/dearai.git
    cd dear_ai
    ```

2.  **Install dependencies:**
    This project uses [Bun](https://bun.sh/) as the JavaScript runtime and package manager.
    ```bash
    bun install
    ```

3.  **Set up Environment Variables (if applicable):**
    If the project requires any environment variables (e.g., API keys for AI services), create a `.env.local` file in the root directory. You might find an `.env.example` file with the required variables to guide you.

4.  **Start the development server and run the app:**

    You have a couple of primary ways to run the app during development:

    *   **Using Expo Go (for quick iteration without native changes):**
        This is often the fastest way to see your app running on a physical device (using the Expo Go app) or in an Android Emulator/iOS Simulator.
        ```bash
        bun start
        ```
        or, if you prefer using npx with Expo CLI directly:
        ```bash
        npx expo start
        ```
        After running the command, the Metro bundler will start, and you'll see a QR code in the terminal.
        *   **On a physical device:** Install the "Expo Go" app (from the App Store or Google Play Store) and scan the QR code.
        *   **On an emulator/simulator:** Press `a` in the terminal to attempt to open on a connected Android emulator/device, or `i` to attempt to open on an iOS simulator.

    *   **Creating and Using a Development Build with EAS (recommended for projects with custom native code or for testing specific native features):**
        A development build includes your app's native code, allowing you to test any custom native modules or configurations.
        
        First, ensure you have the EAS CLI installed and are logged in:
        ```bash
        # Install EAS CLI globally if you haven't already
        npm install -g eas-cli
        
        # Log in to your Expo account
        eas login
        ```
        
        Then, create a development build for your desired platform (e.g., Android):
        ```bash
        # For Android
        eas build -p android --profile development

        # For iOS (Note: Requires a paid Apple Developer account and macOS for local simulator builds or EAS Build for cloud builds)
        # eas build -p ios --profile development
        ```
        This command will build your app and provide you with an installable file (`.apk` for Android, `.app` or a link for iOS).
        
        Once the build is complete:
        1.  Install the development build onto your physical device or emulator/simulator.
        2.  Start the Metro development server:
            ```bash
            bun start
            ```
            or
            ```bash
            npx expo start
            ```
        3.  Open the installed "Dear AI" development build app on your device/emulator. It will connect to the running Metro server.

5.  **Start Developing:**
    Open the project in your preferred code editor. You can start editing files, primarily within the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction) powered by Expo Router. Changes you make should automatically reload in the app.
