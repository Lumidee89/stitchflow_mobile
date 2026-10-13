import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { Card } from '../../../src/components/Card';
import { NotificationBell } from '../../../src/components/NotificationBell';
import { PipelineStepper } from '../../../src/components/PipelineStepper';
import { EmptyState, ErrorState, LoadingState } from '../../../src/components/StateViews';
import { useAuth } from '../../../src/context/AuthContext';
import { ordersApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, spacing, typography } from '../../../src/theme';
import { formatCurrency, greeting, ORDER_STATUS_LABEL } from '../../../src/utils/format';

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const { data: orders, loading, error, refresh } = useAsync(() => ordersApi.list(), [], true);

  const activeOrders = (orders ?? []).filter((o) => o.status !== 'delivered');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl tintColor={colors.gold} refreshing={loading && !!orders} onRefresh={refresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{user?.name ?? 'there'}</Text>
          </View>
          <View style={styles.headerActions}>
            <NotificationBell href="/(customer)/notifications" />
            <Avatar name={user?.name ?? 'U'} size={44} />
          </View>
        </View>

        <Pressable onPress={()=>router.push('/(customer)/wardrobe')}><Card style={styles.wardrobeCard}><View><Text style={styles.wardrobeTitle}>Your digital wardrobe</Text><Text style={styles.wardrobeText}>See delivered looks, fabrics and care notes in one place.</Text></View><View style={styles.wardrobeIcon}><Ionicons name="shirt-outline" size={24} color={colors.onGold}/></View></Card></Pressable>

        {loading && !orders && <LoadingState label="Loading your orders…" />}
        {error && !orders && <ErrorState message={error} onRetry={refresh} />}

        {orders && activeOrders.length === 0 && (
          <EmptyState icon="shirt-outline" title="No active orders" message="Your bespoke orders will appear here once your designer creates one." />
        )}

        {activeOrders.map((order) => (
          <Pressable key={order.id} onPress={() => router.push(`/(customer)/orders/${order.id}`)}>
            <Card style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <Badge label={ORDER_STATUS_LABEL[order.status]} tone="gold" />
              </View>
              <View style={styles.stepperWrap}>
                <PipelineStepper status={order.status} />
              </View>
              {order.balance_due > 0 && (
                <View style={styles.balanceRow}>
                  <Ionicons name="wallet-outline" size={16} color={colors.warning} />
                  <Text style={styles.balanceText}>{formatCurrency(order.balance_due)} balance due</Text>
                </View>
              )}
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl * 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  greeting: { ...typography.caption, color: colors.textSecondary },
  name: { ...typography.h1, color: colors.textPrimary, marginTop: 2 },
  orderCard: { gap: spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTitle: { ...typography.bodyStrong, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  stepperWrap: { marginTop: spacing.xs },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  balanceText: { ...typography.caption, color: colors.warning },
  wardrobeCard:{backgroundColor:colors.teal,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},wardrobeTitle:{...typography.bodyStrong,color:'#fff',fontSize:17},wardrobeText:{...typography.caption,color:'#DCEBEC',maxWidth:240,marginTop:4},wardrobeIcon:{width:48,height:48,borderRadius:24,backgroundColor:colors.gold,alignItems:'center',justifyContent:'center'},
});
