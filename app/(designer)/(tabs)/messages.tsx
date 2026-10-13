import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Avatar } from '../../../src/components/Avatar';
import { Card } from '../../../src/components/Card';
import { EmptyState, ErrorState, LoadingState } from '../../../src/components/StateViews';
import { messagesApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, spacing, typography } from '../../../src/theme';

export default function MessagesScreen() {
  const { data: customers, loading, error, refresh } = useAsync(() => messagesApi.conversations(), [], true);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading && !customers && <LoadingState label="Loading conversations…" />}
      {error && !customers && <ErrorState message={error} onRetry={refresh} />}
      {customers && customers.length === 0 && (
        <EmptyState icon="chatbubble-ellipses-outline" title="No conversations yet" message="Messages with clients will show up here." />
      )}

      <FlatList
        data={customers ?? []}
        keyExtractor={(c) => String(c.customer_id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/(designer)/messages/[customerId]', params: { customerId: item.customer_id, name: item.name } })}>
            <Card style={styles.row}>
              <Avatar name={item.name} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.last_message ?? 'Tap to start a conversation'}
                </Text>
              </View>
              {item.unread_count > 0 && <View style={styles.unread}><Text style={styles.unreadText}>{item.unread_count}</Text></View>}
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1 },
  name: { ...typography.bodyStrong, color: colors.textPrimary },
  preview: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  unread: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  unreadText: { ...typography.caption, color: '#fff', fontWeight: '700', fontSize: 11 },
});
