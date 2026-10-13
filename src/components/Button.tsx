import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadow, spacing, typography } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, icon, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={[styles.wrapper, style]}>
        {({ pressed }) => (
          <LinearGradient
            colors={gradients.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.base, shadow.gold, isDisabled && styles.disabled, pressed && styles.pressed]}
          >
            {loading ? (
              <ActivityIndicator color={colors.onGold} />
            ) : (
              <View style={styles.content}>
                <Text style={styles.primaryLabel}>{label}</Text>
                {icon}
              </View>
            )}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles.secondary,
          isDisabled && styles.disabled,
          pressed && styles.pressed,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.content}>
            <Text style={styles.secondaryLabel}>{label}</Text>
            {icon}
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.ghost, isDisabled && styles.disabled, pressed && styles.pressed, style]}
    >
      <Text style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: radius.pill },
  base: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  secondary: {
    backgroundColor: colors.teal,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  primaryLabel: { ...typography.bodyStrong, color: colors.onGold, fontSize: 12 },
  secondaryLabel: { ...typography.bodyStrong, color: '#FFFFFF', fontSize: 12 },
  ghostLabel: { ...typography.bodyStrong, color: colors.teal },
});
