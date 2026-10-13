import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Avatar } from '../../../src/components/Avatar';
import { Card } from '../../../src/components/Card';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing, typography } from '../../../src/theme';
import { useFeedback } from '../../../src/context/FeedbackContext';

const MENU: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; phase?: string }> = [
  { icon: 'bar-chart-outline', label: 'Reports' },
  { icon: 'cube-outline', label: 'Inventory' },
  { icon: 'people-outline', label: 'Staff' },
  { icon: 'calendar-outline', label: 'Calendar' },
  { icon: 'sparkles-outline', label: 'AI Business Coach', phase: 'Phase 3' },
  { icon: 'settings-outline', label: 'Settings' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { confirm, alert } = useFeedback();

  const onLogout = async () => {
    if (await confirm({ title: 'Log out?', message: 'You’ll need to sign in again to access your workspace.', confirmLabel: 'Log Out', cancelLabel: 'Stay Signed In', destructive: true })) await logout();
  };
  const routes: Record<string, any> = { Reports: '/(designer)/reports', Inventory: '/(designer)/inventory', Staff: '/(designer)/staff', Calendar: '/(designer)/calendar', Settings: '/(designer)/settings' };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Avatar name={user?.name ?? 'U'} size={80} />
          <Text style={styles.name}>{user?.name}</Text>
          {!!user?.business_name && <Text style={styles.business}>{user.business_name}</Text>}
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.menuCard}>
          {MENU.map((item, idx) => (
            <Pressable
              key={item.label}
              style={[styles.menuRow, idx > 0 && styles.menuDivider]}
              onPress={() => item.phase ? alert({ title: item.label, message: `Coming in ${item.phase} of the StitchFlow roadmap.` }) : routes[item.label] && router.push(routes[item.label])}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={colors.gold} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.phase && <Text style={styles.menuPhase}>{item.phase}</Text>}
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>

        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.xl },
  header: { alignItems: 'center', gap: 4 },
  name: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.md },
  business: { ...typography.bodyStrong, color: colors.gold },
  email: { ...typography.caption, color: colors.textSecondary },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  menuDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  menuPhase: { ...typography.caption, color: colors.textMuted, fontSize: 11, marginRight: spacing.sm },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg },
  logoutText: { ...typography.bodyStrong, color: colors.danger },
});
