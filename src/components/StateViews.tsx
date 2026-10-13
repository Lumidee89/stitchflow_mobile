import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors, spacing, typography } from '../theme';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.gold} size="large" />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={32} color={colors.textMuted} />
      <Text style={styles.errorTitle}>Couldn't load this</Text>
      <Text style={styles.muted}>{message}</Text>
      {onRetry && <Button label="Try Again" variant="secondary" onPress={onRetry} style={styles.retry} />}
    </View>
  );
}

export function EmptyState({ icon = 'file-tray-outline', title, message }: { icon?: keyof typeof Ionicons.glyphMap; title: string; message?: string }) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={32} color={colors.textMuted} />
      <Text style={styles.errorTitle}>{title}</Text>
      {!!message && <Text style={styles.muted}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  muted: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  errorTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  retry: { marginTop: spacing.md, minWidth: 160 },
});
