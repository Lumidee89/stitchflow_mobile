import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";
import { ApiError } from "../../src/api/client";
import { colors, spacing, typography } from "../../src/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const authenticatedUser = await login(email.trim(), password);
      router.replace(
        !authenticatedUser.email_verified ? "/(auth)/verify-email" : authenticatedUser.role === "designer"
          ? "/(designer)/dashboard"
          : "/(customer)/home",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.title}>
            Keep your fashion{`\n`}business flowing.
          </Text>
          <Text style={styles.subtitle}>Sign in to manage today’s work.</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Email Address"
            icon="mail-outline"
            placeholder="atelier@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            isPassword
            value={password}
            onChangeText={setPassword}
            rightAction={{ label: "Forgot?", onPress: () => router.push('/(auth)/forgot-password') }}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Button
            label="Sign In"
            onPress={onSubmit}
            loading={loading}
            icon={
              <Ionicons name="arrow-forward" size={18} color={colors.onGold} />
            }
            style={styles.submit}
          />

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to StitchFlow? </Text>
            <Link href="/(auth)/role-select" replace>
              <Text style={styles.footerLink}>Create Account</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  header: { alignItems: "flex-start", marginBottom: spacing.xxl },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
    alignSelf: "flex-start",
  },
  eyebrow: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  title: { ...typography.display, color: colors.teal, lineHeight: 39 },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  form: { width: "100%" },
  submit: { marginTop: spacing.sm },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  footerRow: { flexDirection: "row", justifyContent: "center" },
  footerText: { ...typography.caption, color: colors.textSecondary },
  footerLink: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
