import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";
import { ApiError } from "../../src/api/client";
import { colors, radius, spacing, typography } from "../../src/theme";
import type { Role } from "../../src/types";
import { useFeedback } from "../../src/context/FeedbackContext";

export default function SignupScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const { register } = useAuth();
  const { toast } = useFeedback();

  const [role, setRole] = useState<Role>(
    params.role === "customer" ? "customer" : "designer",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      setError("Please fill in your name, email, and password.");
      toast("Please fill in your name, email, and password.", "error", "Missing details");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, phone, password, password_confirmation: password, role });
      router.replace('/(auth)/verify-email');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast(message, "error", "Could not create account");
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
          <Text style={styles.subtitle}>Create your workspace</Text>
        </View>

        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setRole("customer")}
            style={[
              styles.toggleBtn,
              role === "customer" && styles.toggleBtnActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                role === "customer" && styles.toggleTextActive,
              ]}
            >
              CLIENT
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setRole("designer")}
            style={[
              styles.toggleBtn,
              role === "designer" && styles.toggleBtnActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                role === "designer" && styles.toggleTextActive,
              ]}
            >
              DESIGNER
            </Text>
          </Pressable>
        </View>

        <TextField
          label="Full Name"
          placeholder="Jane Doe"
          value={name}
          onChangeText={setName}
        />
        <TextField
          label="Email Address"
          placeholder="jane@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          label="Phone Number"
          placeholder="+1 (555) 000-0000"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextField
          label="Password"
          placeholder="••••••••"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Button
          label="Create Account"
          onPress={onSubmit}
          loading={loading}
          style={styles.submit}
        />

        <Text style={styles.terms}>
          By signing up, you agree to StitchFlow's{"\n"}
          <Text style={styles.termsLink} onPress={()=>Linking.openURL(`${process.env.EXPO_PUBLIC_SITE_URL||'https://stitchflow.app'}/terms`)}>Terms of Service</Text> and{" "}
          <Text style={styles.termsLink} onPress={()=>Linking.openURL(`${process.env.EXPO_PUBLIC_SITE_URL||'https://stitchflow.app'}/privacy`)}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    padding: spacing.xxl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: 160,
  },
  header: { alignItems: "center", marginBottom: spacing.xxl },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
    alignSelf: "center",
  },
  title: {
    ...typography.h1,
    color: colors.gold,
    letterSpacing: 3,
    fontSize: 24,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.xl,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: colors.goldMuted },
  toggleText: { ...typography.label, color: colors.textSecondary },
  toggleTextActive: { color: colors.gold },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  submit: { marginTop: spacing.sm },
  terms: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  termsLink: { color: colors.gold },
});
