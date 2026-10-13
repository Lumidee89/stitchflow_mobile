import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, BadgeTone } from '../../../src/components/Badge';
import { Card } from '../../../src/components/Card';
import { EmptyState, ErrorState, LoadingState } from '../../../src/components/StateViews';
import { ordersApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, radius, spacing, typography } from '../../../src/theme';
import { formatCurrency, ORDER_STATUS_LABEL } from '../../../src/utils/format';
import type { OrderStatus } from '../../../src/types';

const FILTERS: Array<{ key: 'all' | OrderStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'measurement', label: 'Measured' },
  { key: 'cutting', label: 'Cutting' },
  { key: 'sewing', label: 'Sewing' },
  { key: 'quality_check', label: 'Quality' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  pending: 'neutral',
  measurement: 'info',
  cutting: 'warning',
  sewing: 'warning',
  embellishment: 'warning',
  ironing: 'warning',
  quality_check: 'info',
  ready: 'success',
  delivered: 'gold',
};

export default function OrdersScreen() {
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const { data, loading, error, refresh } = useAsync(() => ordersApi.list(), [], true);

  const filtered = useMemo(() => {
    if (!data) return [];
    return filter === 'all' ? data : data.filter((o) => o.status === filter);
  }, [data, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.headerButtons}><Pressable style={styles.groupBtn} onPress={()=>router.push('/(designer)/order-groups')}><Ionicons name="people-outline" size={20} color={colors.teal}/></Pressable><Pressable style={styles.addBtn} onPress={() => router.push('/(designer)/orders/new')}>
          <Ionicons name="add" size={22} color={colors.onGold} />
        </Pressable></View>
      </View>

      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(f) => f.key}
        contentContainerStyle={styles.filterRow}
        style={styles.filterList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setFilter(item.key)}
            style={[styles.chip, filter === item.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === item.key && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        )}
      />

      {loading && !data && <LoadingState label="Loading orders…" />}
      {error && !data && <ErrorState message={error} onRetry={refresh} />}
      {data && filtered.length === 0 && (
        <EmptyState icon="briefcase-outline" title="No orders here" message="Try a different filter or create a new order." />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={loading && !!data}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(designer)/orders/${item.id}`)}>
            <Card style={styles.orderCard}>
              <View style={styles.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderTitle}>{item.title}</Text>
                  <Text style={styles.orderSub}>{item.customer?.name ?? 'Customer'}</Text>
                </View>
                <Badge label={ORDER_STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderPrice}>{formatCurrency(item.price)}</Text>
                {item.balance_due > 0 && (
                  <Text style={styles.orderBalance}>{formatCurrency(item.balance_due)} due</Text>
                )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtons:{flexDirection:'row',gap:spacing.sm},groupBtn:{width:40,height:40,borderRadius:20,backgroundColor:colors.tealMuted,alignItems:'center',justifyContent:'center'},
  filterList: { flexGrow: 0, height: 68 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, alignItems: 'center' },
  chip: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.md },
  orderCard: { gap: spacing.md },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  orderSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  orderPrice: { ...typography.bodyStrong, color: colors.textPrimary },
  orderBalance: { ...typography.caption, color: colors.warning },
});
