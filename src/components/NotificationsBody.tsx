import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState } from './StateViews';
import { notificationsApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { colors, radius, spacing, typography } from '../theme';
import type { AppNotification } from '../types';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  order_status_updated: 'cut-outline',
  payment_received: 'wallet-outline',
  login_successful: 'log-in-outline',
  delivery_due_soon: 'alarm-outline',
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsBody() {
  const { data, loading, error, refresh } = useAsync(() => notificationsApi.list(), [], true);

  const onOpen = async (n: AppNotification) => {
    if (!n.read_at) {
      try {
        await notificationsApi.markRead(n.id);
        refresh();
      } catch {
        // non-critical - the notification still opens even if the read-marking call fails
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable
          onPress={async () => {
            await notificationsApi.markAllRead();
            refresh();
          }}
          hitSlop={10}
        >
          <Text style={styles.markAll}>Mark all read</Text>
        </Pressable>
      </View>

      {loading && !data && <LoadingState label="Loading notifications…" />}
      {error && !data && <ErrorState message={error} onRetry={refresh} />}
      {data && data.notifications.length === 0 && (
        <EmptyState icon="notifications-outline" title="No notifications yet" message="Login, order, payment and delivery reminders will show up here." />
      )}

      <FlatList
        data={data?.notifications ?? []}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={loading && !!data}
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpen(item)} style={[styles.row, !item.read_at && styles.rowUnread]}>
            <View style={styles.iconWrap}>
              <Ionicons name={ICONS[item.type] ?? 'notifications-outline'} size={18} color={colors.gold} />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
            </View>
            {!item.read_at && <View style={styles.unreadDot} />}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 16 },
  markAll: { ...typography.caption, color: colors.gold, fontWeight: '600' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  rowUnread: { borderColor: colors.borderStrong, backgroundColor: colors.surfaceAlt },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  title: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 14 },
  body: { ...typography.caption, color: colors.textSecondary },
  time: { ...typography.caption, color: colors.textMuted, fontSize: 11, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold, marginTop: 4 },
});
