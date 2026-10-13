import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightAction?: { label: string; onPress: () => void };
  isPassword?: boolean;
  error?: string;
}

export function TextField({ label, icon, rightAction, isPassword, error, style, ...rest }: TextFieldProps) {
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View style={styles.container}>
      {!!label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label.toUpperCase()}</Text>
          {rightAction && (
            <Pressable onPress={rightAction.onPress} hitSlop={8}>
              <Text style={styles.rightAction}>{rightAction.label}</Text>
            </Pressable>
          )}
        </View>
      )}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.icon} />}
        <TextInput
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          style={[styles.input, style]}
          {...rest}
        />
        {isPassword && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.label, color: colors.textSecondary },
  rightAction: { ...typography.caption, color: colors.gold, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    gap: spacing.md,
  },
  inputError: { borderColor: colors.danger },
  icon: { marginRight: 0 },
  input: { flex: 1, color: colors.textPrimary, fontSize: 15, paddingVertical: spacing.sm },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
