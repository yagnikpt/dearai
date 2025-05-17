declare module "*.svg" {
	import type React from "react";
	import type { SvgProps } from "react-native-svg";
	const content: React.FC<SvgProps>;
	export default content;
}

declare module "react-native/Libraries/Utilities/PolyfillFunctions" {
	export function polyfillGlobal(name: string, getValue: () => any): void;
}
