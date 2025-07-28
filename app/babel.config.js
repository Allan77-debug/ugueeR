module.exports = function (api) {
  const isWeb = api.caller((caller) => !!caller && caller.platform === "web");
  // Cache the config based on the platform.
  api.cache.using(() => isWeb);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            // Use the web-specific maps implementation only on web
            "react-native-maps": isWeb
              ? "@teovilla/react-native-web-maps"
              : "react-native-maps",
          },
        },
      ],
    ],
  };
};