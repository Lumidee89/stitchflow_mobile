import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { Role } from '../../src/types';

const OPTIONS: Array<{
  role: Role;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    role: 'designer',
    title: 'I am a Designer',
    description: 'Manage your fashion house, track bespoke orders, and client measurements in one operating system.',
    icon: 'cut-outline',
  },
  {
    role: 'customer',
    title: 'I am a Customer',
    description: 'Connect with top tailors, manage your wardrobe measurements, and track your bespoke orders.',
    icon: 'person-outline',
  },
];

export default function RoleSelectScreen() {
  const [selected, setSelected] = useState<Role>('designer');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join StitchFlow</Text>
      <Text style={styles.subtitle}>Select how you will use the platform</Text>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const active = option.role === selected;
          return (
            <Pressable
              key={option.role}
              onPress={() => setSelected(option.role)}
              style={[styles.optionCard, active && styles.optionCardActive]}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
                  <Ionicons name={option.icon} size={22} color={active ? colors.gold : colors.textSecondary} />
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </View>
              <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={() => router.push({ pathname: '/(auth)/signup', params: { role: selected } })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xxl, paddingTop: spacing.xxl * 2 },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', fontSize: 24 },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  options: { gap: spacing.lg },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  optionCardActive: { borderColor: colors.gold, backgroundColor: colors.surfaceAlt },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: { backgroundColor: colors.goldMuted },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.gold },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.gold },
  optionTitle: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.lg },
  optionTitleActive: { color: colors.gold },
  optionDescription: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 19 },
  footer: { marginTop: 'auto', paddingTop: spacing.xl },
});
