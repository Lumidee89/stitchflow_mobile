import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationsApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { colors } from '../theme';

export function NotificationBell({ href }: { href: '/(designer)/notifications' | '/(customer)/notifications' }) {
  const { data } = useAsync(() => notificationsApi.list(), [], true);
  const unread = data?.unread_count ?? 0;

  return (
    <Pressable style={styles.iconBtn} onPress={() => router.push(href)}>
      <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
