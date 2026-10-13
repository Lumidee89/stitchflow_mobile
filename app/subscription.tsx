import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View, Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { subscriptionApi } from "../src/api";
import { useAuth } from "../src/context/AuthContext";
import type { SubscriptionPlan } from "../src/types";
import { colors, radius, shadow, spacing, typography } from "../src/theme";
import { TextField } from "../src/components/TextField";
import { useFeedback } from "../src/context/FeedbackContext";

export default function SubscriptionScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useFeedback();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [billingEmail, setBillingEmail] = useState(user?.email ?? "");
  const [pendingReference, setPendingReference] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (pendingReference) {
      try { await subscriptionApi.verify(pendingReference); setPendingReference(null); toast('Your subscription is now active.', 'success', 'Payment confirmed'); }
      catch { /* A pending or cancelled checkout is handled by the status refresh below. */ }
    }
    const next = await refreshUser();
    if (next?.role === "designer" && next.subscription?.has_access)
      router.replace("/(designer)/dashboard");
  }, [pendingReference, refreshUser, toast]);

  useEffect(() => {
    subscriptionApi
      .plans()
      .then(setPlans)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const subscribe = async (plan: SubscriptionPlan["id"]) => {
    setBusy(plan);
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(billingEmail)) {
      toast("Enter a valid billing email address.", "error", "Check your email");
      setBusy(null);
      return;
    }
    try {
      const checkout = await subscriptionApi.initialize(plan, billingEmail.trim());
      setPendingReference(checkout.reference);
      if (checkout.fully_credited) { toast('Your reward credit covered this subscription.', 'success', 'Subscription activated'); await refresh(); }
      else if (checkout.authorization_url) await Linking.openURL(checkout.authorization_url);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Unable to start payment.", "error", "Payment could not start");
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.top}>
          <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          <Pressable onPress={logout}>
            <Text style={styles.signout}>Sign out</Text>
          </Pressable>
        </View>
        <Text style={styles.eyebrow}>STITCHFLOW FOR DESIGNERS</Text>
        <Text style={styles.title}>
          {user?.subscription?.on_trial
            ? "Your free trial is active."
            : "Keep your atelier in flow."}
        </Text>
        <Text style={styles.body}>
          {user?.subscription?.on_trial
            ? `Enjoy full access until ${new Date(user.subscription.trial_ends_at!).toLocaleDateString()}. Subscribe now to avoid an interruption.`
            : "Choose a plan to use your dashboard, clients, orders, reports and production tools. Client accounts always remain free."}
        </Text>
        <TextField label="Billing email" value={billingEmail} onChangeText={setBillingEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
        <Text style={styles.emailHint}>Paystack sends the receipt here.</Text>
        {error ? (
          <View style={styles.error}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <View style={styles.cards}>
          {plans.map((plan) => (
            <View
              key={plan.id}
              style={[styles.card, plan.id === "annual" && styles.featured]}
            >
              {plan.id === "annual" ? (
                <Text style={styles.badge}>BEST VALUE</Text>
              ) : null}
              <Text style={styles.plan}>{plan.name}</Text>
              <Text style={styles.price}>
                ₦{plan.amount.toLocaleString()}
                <Text style={styles.period}>
                  {" "}
                  / {plan.id === "annual" ? "year" : "month"}
                </Text>
              </Text>
              <Text style={styles.detail}>
                All business features
                {plan.id === "annual" ? " • Save ₦6,000" : ""}
              </Text>
              <Pressable
                style={styles.button}
                onPress={() => subscribe(plan.id)}
                disabled={!!busy}
              >
                {busy === plan.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Choose {plan.name}</Text>
                )}
              </Pressable>
            </View>
          ))}
        </View>
        <Pressable style={styles.refresh} onPress={refresh}>
          <Ionicons name="refresh" size={18} color={colors.teal} />
          <Text style={styles.refreshText}>I’ve paid — refresh access</Text>
        </Pressable>
        <Text style={styles.note}>
          Secure checkout opens in your browser. When payment is complete,
          return here and your access will update automatically.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 50 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 38,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "flex-start",
  },
  signout: { ...typography.bodyStrong, color: colors.textSecondary },
  eyebrow: { ...typography.label, color: colors.goldDeep, marginBottom: 12 },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 36,
    lineHeight: 40,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 23,
    marginTop: 16,
    marginBottom: 24,
  },
  emailHint: { ...typography.caption, color: colors.textMuted, lineHeight: 18, marginTop: -4, marginBottom: spacing.lg },
  cards: { gap: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  featured: { borderColor: colors.gold, borderWidth: 2 },
  badge: { ...typography.label, color: colors.goldDeep, marginBottom: 12 },
  plan: { ...typography.h2, color: colors.textPrimary },
  price: { fontSize: 31, fontWeight: "800", color: colors.teal, marginTop: 9 },
  period: { ...typography.caption, color: colors.textSecondary },
  detail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 18,
  },
  button: {
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { ...typography.bodyStrong, color: "#fff" },
  refresh: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  refreshText: { ...typography.bodyStrong, color: colors.teal },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  error: {
    backgroundColor: colors.dangerMuted,
    padding: 13,
    borderRadius: radius.md,
    marginBottom: 14,
  },
  errorText: { color: colors.danger },
});
