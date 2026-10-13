import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function DesignerLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isLoading && (!user || user.role !== 'designer')) return <Redirect href="/(auth)/login" />;
  if (user && !user.subscription?.has_access) return <Redirect href="/subscription" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="customers/index" />
      <Stack.Screen name="customers/new" />
      <Stack.Screen name="customers/[id]" />
      <Stack.Screen name="orders/new" />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="order-groups" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="messages/[customerId]" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="staff" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
