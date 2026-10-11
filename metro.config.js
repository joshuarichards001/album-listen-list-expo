const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config, {
  inlineVariables: false,
  // react-native-css defaults to a 14px rem, which shrinks the spacing scale.
  inlineRem: 16,
  globalClassNamePolyfill: false,
});
