import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FormSheet } from './FormSheet';
import { TextField } from './TextField';
import { Button } from './Button';
import { ordersApi } from '../api';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency } from '../utils/format';
import type { Payment } from '../types';
import { useFeedback } from '../context/FeedbackContext';

const METHODS: Array<{ key: Payment['method']; label: string }> = [
  { key: 'cash', label: 'Cash' },
  { key: 'card', label: 'Card' },
  { key: 'transfer', label: 'Transfer' },
  { key: 'paystack', label: 'Paystack' },
  { key: 'flutterwave', label: 'Flutterwave' },
];

interface RecordPaymentSheetProps {
  visible: boolean;
  orderId: number;
  balanceDue: number;
  onClose: () => void;
  onRecorded: () => void;
}

export function RecordPaymentSheet({ visible, orderId, balanceDue, onClose, onRecorded }: RecordPaymentSheetProps) {
  const { toast } = useFeedback();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Payment['method']>('cash');
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setAmount('');
    setMethod('cash');
    setReference('');
  };

  const onSubmit = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast('Enter an amount greater than zero.', 'error', 'Invalid amount');
      return;
    }
    setSaving(true);
    try {
      await ordersApi.addPayment(orderId, { amount: numericAmount, method, reference: reference || undefined });
      reset();
      onRecorded();
    } catch (err: any) {
      toast(err?.message ?? 'Please try again.', 'error', 'Could not record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet
      visible={visible}
      title="Record Payment"
      onClose={() => {
        reset();
        onClose();
      }}
    >
      {balanceDue > 0 && <Text style={styles.balanceHint}>Balance due: {formatCurrency(balanceDue)}</Text>}

      <TextField
        label="Amount (₦)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        rightAction={
          balanceDue > 0 ? { label: 'Use full balance', onPress: () => setAmount(String(balanceDue)) } : undefined
        }
      />

      <Text style={styles.label}>PAYMENT METHOD</Text>
      <View style={styles.methodRow}>
        {METHODS.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => setMethod(m.key)}
            style={[styles.methodChip, method === m.key && styles.methodChipActive]}
          >
            <Text style={[styles.methodText, method === m.key && styles.methodTextActive]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <TextField
        label="Reference (optional)"
        placeholder="Transaction ID or note"
        value={reference}
        onChangeText={setReference}
      />

      <Button label="Record Payment" onPress={onSubmit} loading={saving} style={styles.submit} />
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  balanceHint: { ...typography.caption, color: colors.warning, marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  methodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodChipActive: { backgroundColor: colors.goldMuted, borderColor: colors.gold },
  methodText: { ...typography.caption, color: colors.textSecondary },
  methodTextActive: { color: colors.gold, fontWeight: '600' },
  submit: { marginTop: spacing.sm },
});
