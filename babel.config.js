module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Reanimated plugin must be listed last (it internally registers react-native-worklets)
      "react-native-reanimated/plugin",
    ],
  };
};
