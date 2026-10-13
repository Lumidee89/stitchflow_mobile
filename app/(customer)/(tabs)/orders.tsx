import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../../src/components/Badge';
import { Card } from '../../../src/components/Card';
import { EmptyState, ErrorState, LoadingState } from '../../../src/components/StateViews';
import { ordersApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, spacing, typography } from '../../../src/theme';
import { formatCurrency, ORDER_STATUS_LABEL } from '../../../src/utils/format';

export default function CustomerOrdersScreen() {
  const { data, loading, error, refresh } = useAsync(() => ordersApi.list(), [], true);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {loading && !data && <LoadingState label="Loading orders…" />}
      {error && !data && <ErrorState message={error} onRetry={refresh} />}
      {data && data.length === 0 && (
        <EmptyState icon="briefcase-outline" title="No orders yet" message="Order history and reorders will appear here." />
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={loading && !!data}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(customer)/orders/${item.id}`)}>
            <Card style={styles.orderCard}>
              <View style={styles.orderRow}>
                <Text style={styles.orderTitle}>{item.title}</Text>
                <Badge label={ORDER_STATUS_LABEL[item.status]} tone={item.status === 'delivered' ? 'success' : 'gold'} />
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderPrice}>{formatCurrency(item.price)}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
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
  orderCard: { gap: spacing.md },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTitle: { ...typography.bodyStrong, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  orderPrice: { ...typography.bodyStrong, color: colors.textPrimary },
});
