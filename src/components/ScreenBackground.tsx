import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme';

export function ScreenBackground({ style, children, ...rest }: ViewProps) {
  return (
    <LinearGradient colors={gradients.backgroundGlow} style={[styles.fill, style]} {...rest}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
