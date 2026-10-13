import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../../src/components/Badge';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { PipelineStepper } from '../../../src/components/PipelineStepper';
import { RecordPaymentSheet } from '../../../src/components/RecordPaymentSheet';
import { ErrorState, LoadingState } from '../../../src/components/StateViews';
import { ordersApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, radius, spacing, typography } from '../../../src/theme';
import { formatCurrency, ORDER_STATUS_LABEL } from '../../../src/utils/format';
import type { OrderStatus } from '../../../src/types';
import { useFeedback } from '../../../src/context/FeedbackContext';
import { TextField } from '../../../src/components/TextField';

export default function OrderDetailScreen() {
  const { toast } = useFeedback();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const [updating, setUpdating] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [expenseOpen,setExpenseOpen]=useState(false); const [expenseDescription,setExpenseDescription]=useState(''); const [expenseAmount,setExpenseAmount]=useState(''); const [expenseCategory,setExpenseCategory]=useState<'fabric'|'trims'|'labour'|'transport'|'outsourcing'|'other'>('fabric'); const [savingExpense,setSavingExpense]=useState(false);
  const { data: order, loading, error, refresh } = useAsync(() => ordersApi.get(orderId), [orderId]);
  const { data: payments, refresh: refreshPayments } = useAsync(() => ordersApi.payments(orderId), [orderId]);

  const onUpdateStatus = async (status: OrderStatus) => {
    if (!order || status === order.status) return;
    setUpdating(true);
    try {
      await ordersApi.updateStatus(orderId, status);
      refresh();
    } catch (err: any) {
      toast(err?.message ?? 'Please try again.', 'error', 'Could not update status');
    } finally {
      setUpdating(false);
    }
  };
  const addExpense=async()=>{if(!expenseDescription.trim()||!Number(expenseAmount))return toast('Enter an expense description and amount.','error');setSavingExpense(true);try{await ordersApi.addExpense(orderId,{category:expenseCategory,description:expenseDescription,amount:Number(expenseAmount)});setExpenseDescription('');setExpenseAmount('');setExpenseOpen(false);refresh();toast('Expense added to this garment.','success');}catch(err:any){toast(err?.message??'Could not add expense.','error')}finally{setSavingExpense(false)}};

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
            <Text style={styles.customerName}>{order.customer?.name ?? 'Customer'}</Text>
            {!!order.description && <Text style={styles.description}>{order.description}</Text>}

            <View style={styles.priceRow}>
              <PriceStat label="Total" value={formatCurrency(order.price)} />
              <PriceStat label="Deposit Paid" value={formatCurrency(order.deposit_paid)} />
              <PriceStat label="Balance Due" value={formatCurrency(order.balance_due)} highlight={order.balance_due > 0} />
            </View>
          </Card>

          {order.measurement_snapshot && (
            <Card style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.cardTitle}>Measurements Used</Text>
                <Badge label={order.measurement_snapshot.type} tone="info" />
              </View>
              <View style={styles.measureGrid}>
                {Object.entries(order.measurement_snapshot.fields).map(([label, value]) => (
                  <View key={label} style={styles.measureItem}>
                    <Text style={styles.measureLabel}>{label.replaceAll('_', ' ')}</Text>
                    <Text style={styles.measureValue}>{String(value)} in</Text>
                  </View>
                ))}
              </View>
              {!!order.measurement_snapshot.notes && <Text style={styles.cardHint}>{order.measurement_snapshot.notes}</Text>}
            </Card>
          )}

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Production Status</Text>
            <Text style={styles.cardHint}>Tap a stage to update — the customer is notified automatically.</Text>
            <View style={styles.stepperWrap}>
              <PipelineStepper status={order.status} onSelect={onUpdateStatus} />
            </View>
            {updating && <Text style={styles.updatingText}>Updating…</Text>}
          </Card>

          <Card style={styles.card}>
            <View style={styles.sectionHeaderRow}><Text style={styles.cardTitle}>Garment Profit</Text><Pressable onPress={()=>setExpenseOpen(v=>!v)}><Ionicons name={expenseOpen?'close-circle-outline':'add-circle-outline'} size={21} color={colors.gold}/></Pressable></View>
            <View style={styles.priceRow}><PriceStat label="Selling price" value={formatCurrency(order.price)}/><PriceStat label="Expenses" value={formatCurrency(order.total_expenses??0)}/><PriceStat label="Gross profit" value={formatCurrency(order.gross_profit??order.price)} highlight={(order.gross_profit??order.price)<0}/></View>
            {order.expenses?.map(e=><View key={e.id} style={styles.paymentRow}><View><Text style={styles.paymentAmount}>{e.description}</Text><Text style={styles.paymentMeta}>{e.category.toUpperCase()}</Text></View><Text style={styles.paymentDate}>−{formatCurrency(e.amount)}</Text></View>)}
            {expenseOpen&&<View style={{marginTop:spacing.md}}><View style={styles.typeRow}>{(['fabric','labour','transport','other'] as const).map(c=><Pressable key={c} onPress={()=>setExpenseCategory(c)} style={[styles.typeChip,expenseCategory===c&&styles.typeChipActive]}><Text style={[styles.typeText,expenseCategory===c&&styles.typeTextActive]}>{c}</Text></Pressable>)}</View><TextField label="Expense" value={expenseDescription} onChangeText={setExpenseDescription} placeholder="e.g. Ankara fabric"/><TextField label="Amount (₦)" value={expenseAmount} onChangeText={setExpenseAmount} keyboardType="decimal-pad" placeholder="0.00"/><Button label="Save expense" onPress={addExpense} loading={savingExpense}/></View>}
          </Card>

          <Card style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.cardTitle}>Payments</Text>
              <Pressable onPress={() => setPaymentSheetOpen(true)} hitSlop={8}>
                <Ionicons name="add-circle-outline" size={20} color={colors.gold} />
              </Pressable>
            </View>
            {(payments ?? []).length === 0 && <Text style={styles.emptyText}>No payments recorded yet.</Text>}
            {(payments ?? []).map((p) => (
              <View key={p.id} style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentAmount}>{formatCurrency(p.amount)}</Text>
                  <Text style={styles.paymentMeta}>{p.method.toUpperCase()}</Text>
                </View>
                <Text style={styles.paymentDate}>{new Date(p.paid_at).toLocaleDateString()}</Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      )}

      {order && (
        <RecordPaymentSheet
          visible={paymentSheetOpen}
          orderId={order.id}
          balanceDue={order.balance_due}
          onClose={() => setPaymentSheetOpen(false)}
          onRecorded={() => {
            setPaymentSheetOpen(false);
            refresh();
            refreshPayments();
          }}
        />
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
  customerName: { ...typography.body, color: colors.textSecondary },
  description: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  priceStat: { gap: 4 },
  priceLabel: { ...typography.caption, color: colors.textSecondary, fontSize: 11 },
  priceValue: { ...typography.bodyStrong, color: colors.textPrimary },
  card: { gap: spacing.sm },
  cardTitle: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 16 },
  cardHint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  measureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  measureItem: { width: '47%', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md },
  measureLabel: { ...typography.label, color: colors.textSecondary, textTransform: 'uppercase', fontSize: 9 },
  measureValue: { ...typography.bodyStrong, color: colors.teal, marginTop: 4 },
  stepperWrap: { marginTop: spacing.xs },
  updatingText: { ...typography.caption, color: colors.gold, marginTop: spacing.sm },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyText: { ...typography.caption, color: colors.textSecondary },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  paymentAmount: { ...typography.bodyStrong, color: colors.textPrimary },
  paymentMeta: { ...typography.caption, color: colors.textSecondary, fontSize: 11 },
  paymentDate: { ...typography.caption, color: colors.textMuted },
  typeRow:{flexDirection:'row',flexWrap:'wrap',gap:spacing.xs,marginBottom:spacing.md},typeChip:{paddingHorizontal:spacing.md,paddingVertical:spacing.sm,borderRadius:radius.pill,backgroundColor:colors.surfaceAlt},typeChipActive:{backgroundColor:colors.teal},typeText:{...typography.caption,color:colors.textSecondary,textTransform:'capitalize'},typeTextActive:{color:'#fff',fontWeight:'700'},
});
