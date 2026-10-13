import React, { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../src/api";
import { TextField } from "../src/components/TextField";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { useAuth } from "../src/context/AuthContext";
import { useFeedback } from "../src/context/FeedbackContext";
import { API_URL, setToken } from "../src/api/client";
import { colors, spacing, typography } from "../src/theme";
const SITE =
  process.env.EXPO_PUBLIC_SITE_URL || API_URL.replace(/\/api\/v1$/, "");
export default function AccountSecurity() {
  const { user } = useAuth();
  const { toast, confirm } = useFeedback();
  const [password, setPasswordValue] = useState("");
  const [deleting, setDeleting] = useState(false);
  const exportData = async () => {
    try {
      const data = await authApi.exportData();
      await Share.share({
        title: "My StitchFlow data",
        message: JSON.stringify(data, null, 2),
      });
    } catch (e: any) {
      toast(e.message ?? "Could not export your data.", "error");
    }
  };
  const revoke = async () => {
    if (
      !(await confirm({
        title: "Sign out every device?",
        message:
          "Every StitchFlow mobile session, including this phone, will be revoked.",
        confirmLabel: "Revoke sessions",
        destructive: true,
      }))
    )
      return;
    await authApi.revokeAll();
    await setToken(null);
    router.replace("/(auth)/login");
  };
  const remove = async () => {
    if (!password) return toast("Enter your password first.", "error");
    if (
      !(await confirm({
        title: "Permanently delete account?",
        message:
          "Your StitchFlow account and associated business data will be permanently deleted. This cannot be undone.",
        confirmLabel: "Delete permanently",
        destructive: true,
      }))
    )
      return;
    setDeleting(true);
    try {
      await authApi.deleteAccount(password);
      await setToken(null);
      router.replace("/(auth)/login");
    } catch (e: any) {
      toast(e.message ?? "Could not delete the account.", "error");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.teal} />
        </Pressable>
        <Text style={s.title}>Account & Privacy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Card>
          <Text style={s.cardTitle}>Account security</Text>
          <Text style={s.hint}>
            Signed in as {user?.email}. Mobile access tokens expire after 30
            days and renew securely near expiry.
          </Text>
          <Button
            label="Revoke all mobile sessions"
            onPress={revoke}
            variant="secondary"
          />
        </Card>
        <Card>
          <Text style={s.cardTitle}>Your information</Text>
          <Text style={s.hint}>
            Download a portable copy of your profile, client records,
            measurements, orders and payments.
          </Text>
          <Button label="Export my data" onPress={exportData} />
        </Card>
        <Card>
          <Text style={s.cardTitle}>Policies & support</Text>
          {[
            ["Privacy Policy", "/privacy"],
            ["Terms of Service", "/terms"],
            ["Data retention", "/data-retention"],
            ["Backup & recovery", "/backup-recovery"],
            ["Contact support", "/support"],
          ].map(([label, path]) => (
            <Pressable
              key={path}
              style={s.link}
              onPress={() => Linking.openURL(`${SITE}${path}`)}
            >
              <Text style={s.linkText}>{label}</Text>
              <Ionicons name="open-outline" size={17} color={colors.gold} />
            </Pressable>
          ))}
        </Card>
        <Card style={s.danger}>
          <Text style={s.cardTitle}>Delete account</Text>
          <Text style={s.hint}>
            This permanently removes your account and associated StitchFlow
            records. Export your data first.
          </Text>
          <TextField
            label="Confirm password"
            value={password}
            onChangeText={setPasswordValue}
            isPassword
          />
          <Button
            label="Permanently delete account"
            onPress={remove}
            loading={deleting}
            variant="secondary"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { ...typography.h2, color: colors.textPrimary },
  scroll: { padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 },
  cardTitle: { ...typography.h2, color: colors.teal, marginBottom: spacing.sm },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  link: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linkText: { ...typography.bodyStrong, color: colors.textPrimary },
  danger: { borderWidth: 1, borderColor: colors.danger },
});
