module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native|react-native-css-interop|@shopify/react-native-skia)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/__tests__/**',
    '!app/**/__test__/**',
  ],
  testMatch: [
    './app/**/__tests__/**/*.{js,jsx,ts,tsx}',
    './app/**/__test__/**/*.{js,jsx,ts,tsx}',
    './app/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  moduleNameMapping: {
    '^@/(.*)$': './app/$1',
  },
  testEnvironment: 'node',
};