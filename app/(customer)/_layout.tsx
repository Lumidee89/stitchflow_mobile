import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function CustomerLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isLoading && (!user || user.role !== 'customer')) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="messages/chat" />
      <Stack.Screen name="wardrobe" />
    </Stack>
  );
}
