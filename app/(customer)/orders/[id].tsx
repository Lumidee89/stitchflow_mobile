import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { Badge } from '../../../src/components/Badge';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { PipelineStepper } from '../../../src/components/PipelineStepper';
import { ErrorState, LoadingState } from '../../../src/components/StateViews';
import { ordersApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, spacing, typography } from '../../../src/theme';
import { formatCurrency, ORDER_STATUS_LABEL } from '../../../src/utils/format';
import { useFeedback } from '../../../src/context/FeedbackContext';

export default function CustomerOrderDetailScreen() {
  const { alert, toast } = useFeedback(); const [fitSaving,setFitSaving]=useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const { data: order, loading, error, refresh } = useAsync(() => ordersApi.get(orderId), [orderId]);
  const saveFit=async(rating:'perfect'|'good'|'needs_adjustment')=>{setFitSaving(true);try{await ordersApi.fitFeedback(orderId,{rating});toast('Your fit feedback has been saved.','success');refresh()}catch(err:any){toast(err?.message??'Could not save feedback.','error')}finally{setFitSaving(false)}};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && !order && <LoadingState label="Loading order…" />}
      {error && !order && <ErrorState message={error} onRetry={refresh} />}

      {order && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.orderTitle}>{order.title}</Text>
              <Badge label={ORDER_STATUS_LABEL[order.status]} tone="gold" />
            </View>
            {!!order.description && <Text style={styles.description}>{order.description}</Text>}
            <View style={styles.priceRow}>
              <PriceStat label="Total" value={formatCurrency(order.price)} />
              <PriceStat label="Paid" value={formatCurrency(order.deposit_paid)} />
              <PriceStat label="Balance" value={formatCurrency(order.balance_due)} highlight={order.balance_due > 0} />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Progress</Text>
            <View style={styles.stepperWrap}>
              <PipelineStepper status={order.status} />
            </View>
          </Card>
          {order.status==='delivered'&&<Card style={styles.card}><Text style={styles.cardTitle}>How did it fit?</Text><Text style={styles.description}>Your answer helps your designer improve your next garment.</Text><View style={styles.fitRow}>{([{key:'perfect',label:'Perfect',icon:'sparkles-outline'},{key:'good',label:'Good',icon:'thumbs-up-outline'},{key:'needs_adjustment',label:'Adjust',icon:'resize-outline'}] as const).map(item=><Pressable disabled={fitSaving} key={item.key} onPress={()=>saveFit(item.key)} style={[styles.fitChoice,order.fit_feedback?.rating===item.key&&styles.fitActive]}><Ionicons name={item.icon} size={20} color={order.fit_feedback?.rating===item.key?'#fff':colors.teal}/><Text style={[styles.fitText,order.fit_feedback?.rating===item.key&&{color:'#fff'}]}>{item.label}</Text></Pressable>)}</View></Card>}

          {order.balance_due > 0 && (
            <Button
              label={`Pay ${formatCurrency(order.balance_due)}`}
              onPress={() => alert({ title: 'Client payments', message: 'Online order payments are coming soon. Contact your designer to complete this payment.' })}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PriceStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.priceStat}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={[styles.priceValue, highlight && { color: colors.warning }]}>{value}</Text>
    </View>
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
  scroll: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl * 2 },
  summaryCard: { gap: spacing.sm },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTitle: { ...typography.h2, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  description: { ...typography.caption, color: colors.textSecondary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  priceStat: { gap: 4 },
  priceLabel: { ...typography.caption, color: colors.textSecondary, fontSize: 11 },
  priceValue: { ...typography.bodyStrong, color: colors.textPrimary },
  card: { gap: spacing.sm },
  cardTitle: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 16 },
  stepperWrap: { marginTop: spacing.xs },
  fitRow:{flexDirection:'row',gap:spacing.sm},fitChoice:{flex:1,alignItems:'center',gap:4,padding:spacing.md,borderRadius:14,backgroundColor:colors.surfaceAlt},fitActive:{backgroundColor:colors.teal},fitText:{...typography.caption,color:colors.teal,fontWeight:'700'},
});
