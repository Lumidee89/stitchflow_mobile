import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { colors } from '../src/theme';
import { FeedbackProvider } from '../src/context/FeedbackContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FeedbackProvider>
        <StatusBar
          style="dark"
          hidden={false}
          backgroundColor={colors.background}
          translucent={false}
        />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
      <Stack.Screen name="index" />
      <Stack.Screen name="account-security" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(designer)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="subscription" />
          <Stack.Screen name="invite/[token]" />
        </Stack>
        </FeedbackProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
