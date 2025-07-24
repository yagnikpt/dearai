const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  transformer: {
    ...config.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
  },
  resolver: {
    ...config.resolver,
    assetExts: ["tflite", ...config.resolver.assetExts.filter((ext) => ext !== "svg")],
    sourceExts: [...config.resolver.sourceExts, "svg"]
  }
};