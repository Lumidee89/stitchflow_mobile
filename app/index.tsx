import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/context/AuthContext';
import { colors, gradients, radius, spacing, typography } from '../src/theme';

export default function SplashScreen() {
  const { user, isLoading } = useAuth();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (user) {
        router.replace(!user.email_verified ? '/(auth)/verify-email' : user.role === 'designer'
          ? (user.subscription?.has_access ? '/(designer)/dashboard' : '/subscription')
          : '/(customer)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1600);
    return () => clearTimeout(timer);
  }, [isLoading, user]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fade }]}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>StitchFlow</Text>
        <Text style={styles.tagline}>Personal Styling{'\n'}Reimagined</Text>
        <LinearGradient colors={gradients.goldSubtle} style={styles.pill}>
          <Text style={styles.pillText}>STITCHFLOW</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', gap: spacing.sm },
  logo: { width: 160, height: 160, marginBottom: spacing.md },
  title: { ...typography.display, color: colors.textPrimary, fontSize: 34 },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  pillText: { ...typography.label, color: colors.gold, fontSize: 13 },
});
