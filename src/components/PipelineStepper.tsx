import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { ORDER_PIPELINE } from '../types';
import { ORDER_STATUS_LABEL } from '../utils/format';
import type { OrderStatus } from '../types';

export function PipelineStepper({
  status,
  onSelect,
}: {
  status: OrderStatus;
  onSelect?: (status: OrderStatus) => void;
}) {
  const currentIndex = ORDER_PIPELINE.indexOf(status);

  return (
    <View>
      {ORDER_PIPELINE.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const isLast = index === ORDER_PIPELINE.length - 1;

        return (
          <Pressable key={step} onPress={() => onSelect?.(step)} disabled={!onSelect} style={styles.row}>
            <View style={styles.trackCol}>
              <View style={[styles.dot, (done || active) && styles.dotFilled, active && styles.dotActive]}>
                {done && <Ionicons name="checkmark" size={12} color={colors.onGold} />}
              </View>
              {!isLast && <View style={[styles.line, done && styles.lineFilled]} />}
            </View>
            <Text style={[styles.label, active && styles.labelActive, done && styles.labelDone]}>
              {ORDER_STATUS_LABEL[step]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 40 },
  trackCol: { alignItems: 'center', width: 28 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  dotFilled: { backgroundColor: colors.gold, borderColor: colors.gold },
  dotActive: { borderColor: colors.gold, backgroundColor: colors.background },
  line: { width: 2, flex: 1, minHeight: 20, backgroundColor: colors.border },
  lineFilled: { backgroundColor: colors.gold },
  label: { ...typography.body, color: colors.textSecondary, marginLeft: spacing.md, paddingTop: 1 },
  labelActive: { color: colors.gold, fontWeight: '700' },
  labelDone: { color: colors.textPrimary },
});
