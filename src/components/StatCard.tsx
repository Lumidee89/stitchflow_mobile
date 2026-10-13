import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, spacing, typography } from '../theme';

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  meta?: string;
  metaTone?: 'success' | 'warning' | 'neutral';
}

export function StatCard({ label, value, icon, meta, metaTone = 'neutral' }: StatCardProps) {
  const metaColor =
    metaTone === 'success' ? colors.success : metaTone === 'warning' ? colors.warning : colors.textSecondary;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label} numberOfLines={2}>{label}</Text>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={17} color={colors.teal} />
        </View>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.62}>{value}</Text>
      {!!meta && <Text style={[styles.meta, { color: metaColor }]}>{meta}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, backgroundColor: colors.peach, flex: 1, minWidth: 0, minHeight: 150, padding: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { ...typography.caption, color: colors.textSecondary, flex: 1, paddingRight: spacing.xs, lineHeight: 17 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { ...typography.display, color: colors.teal, fontSize: 23, width: '100%' },
  meta: { ...typography.caption, fontSize: 12 },
});
