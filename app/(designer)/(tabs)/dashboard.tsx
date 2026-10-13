import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../src/components/Avatar";
import { Badge } from "../../../src/components/Badge";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { NotificationBell } from "../../../src/components/NotificationBell";
import { StatCard } from "../../../src/components/StatCard";
import { TrendChart } from "../../../src/components/TrendChart";
import { ErrorState, LoadingState } from "../../../src/components/StateViews";
import { useAuth } from "../../../src/context/AuthContext";
import { dashboardApi } from "../../../src/api";
import { useAsync } from "../../../src/hooks/useAsync";
import { colors, radius, spacing, typography } from "../../../src/theme";
import {
  formatCurrency,
  greeting,
  ORDER_STATUS_LABEL,
} from "../../../src/utils/format";

const CHART_WIDTH =
  Dimensions.get("window").width - spacing.xl * 2 - spacing.lg * 2;
export default function DashboardScreen() {
  const { user } = useAuth();
  const [range, setRange] = useState<"week" | "month">("week");
  const [revenueVisible, setRevenueVisible] = useState(true);
  const { data, loading, error, refresh } = useAsync(
    () => dashboardApi.summary(range),
    [range],
    true,
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            tintColor={colors.gold}
            refreshing={loading && !!data}
            onRefresh={refresh}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{user?.name ?? "there"}</Text>
          </View>
          <View style={styles.headerActions}>
            <NotificationBell href="/(designer)/notifications" />
            <Avatar name={user?.name ?? "U"} size={40} />
          </View>
        </View>

        {loading && !data && <LoadingState label="Loading your dashboard…" />}
        {error && !data && <ErrorState message={error} onRetry={refresh} />}

        {data && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.revenueBlock}>
                  <View style={styles.revenueLabelRow}>
                    <Text style={styles.heroEyebrow}>ALL-TIME REVENUE</Text>
                    <Pressable
                      onPress={() => setRevenueVisible((visible) => !visible)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={
                        revenueVisible ? "Hide revenue" : "Show revenue"
                      }
                    >
                      <Ionicons
                        name={
                          revenueVisible ? "eye-outline" : "eye-off-outline"
                        }
                        size={19}
                        color="#C6D9D8"
                      />
                    </Pressable>
                  </View>
                  <Text
                    style={styles.heroValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {revenueVisible
                      ? formatCurrency(data.all_time_revenue)
                      : "₦ ••••••••"}
                  </Text>
                  {/* <Text style={styles.heroMeta}>Total payments collected since you joined</Text> */}
                </View>
                <View style={styles.progressRing}>
                  <Text style={styles.progressValue}>
                    {data.production_progress_pct}%
                  </Text>
                  <Text style={styles.progressLabel}>AVG DONE</Text>
                </View>
              </View>
              <Pressable
                style={styles.heroButton}
                onPress={() => router.push("/(designer)/orders/new")}
              >
                <Text style={styles.heroButtonText}>Create new order</Text>
                <Ionicons name="arrow-forward" size={17} color={colors.teal} />
              </Pressable>
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                label="Outstanding Balances"
                value={formatCurrency(data.outstanding_balance)}
                icon="wallet-outline"
                meta={`${data.outstanding_balance_clients} clients pending`}
              />
              <StatCard
                label="Orders in Production"
                value={String(data.orders_in_production)}
                icon="cut-outline"
                meta={`${data.orders_due_this_week} due this week`}
                metaTone="warning"
              />
            </View>

            <Card style={styles.rewardCard}>
              <View style={styles.rewardTop}>
                <View style={styles.rewardIcon}>
                  <Ionicons
                    name="gift-outline"
                    size={24}
                    color={colors.goldDeep}
                  />
                </View>
                <View style={styles.rewardHeading}>
                  <View style={styles.rewardEyebrowRow}>
                    <Text style={styles.rewardEyebrow}>CLIENT ONBOARDING REWARDS</Text>
                    {data.rewards.badge && <Badge label={data.rewards.badge} tone="gold" />}
                  </View>
                  <Text style={styles.rewardTitle}>
                    {formatCurrency(data.rewards.credit_balance)} credit
                    available
                  </Text>
                </View>
              </View>
              <View style={styles.rewardStats}>
                <View style={styles.rewardStat}>
                  <Text style={styles.rewardValue}>
                    {data.rewards.onboarded_clients}
                  </Text>
                  <Text style={styles.rewardLabel}>clients onboarded</Text>
                </View>
                <View style={[styles.rewardStat, styles.rewardStatDivider]}>
                  <Text style={styles.rewardValue}>
                    {formatCurrency(data.rewards.earned_this_month)}
                  </Text>
                  <Text style={styles.rewardLabel}>earned this month</Text>
                </View>
              </View>
              <View style={styles.rewardProgress}>
                <View
                  style={[
                    styles.rewardProgressFill,
                    {
                      width: `${Math.min(100, data.rewards.next_milestone ? (data.rewards.onboarded_clients / data.rewards.next_milestone) * 100 : 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.rewardHint}>
                {data.rewards.next_milestone
                  ? `${data.rewards.clients_to_next_milestone} more client${data.rewards.clients_to_next_milestone === 1 ? "" : "s"} to unlock your next bonus.`
                  : "You’ve unlocked every onboarding milestone."}
              </Text>
              <Pressable style={styles.rewardAction} onPress={() => router.push("/(designer)/customers")}>
                <Text style={styles.rewardLink}>Invite clients</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.teal} />
              </Pressable>
            </Card>

            <Text style={styles.sectionLabel}>Quick actions</Text>
            <View style={styles.quickActions}>
              <Button
                label="New Order"
                onPress={() => router.push("/(designer)/orders/new")}
                icon={<Ionicons name="add" size={18} color={colors.onGold} />}
                style={styles.quickBtn}
              />
              <Button
                label="Add Customer"
                variant="secondary"
                onPress={() => router.push("/(designer)/customers/new")}
                icon={
                  <Ionicons
                    name="person-add-outline"
                    size={16}
                    color="#FFFFFF"
                  />
                }
                style={styles.quickBtn}
              />
            </View>

            <SectionCard
              title="Today's Deliveries"
              onViewAll={() => router.push("/(designer)/orders/new")}
            >
              {data.today_deliveries.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nothing scheduled for today.
                </Text>
              ) : (
                data.today_deliveries.map((item, idx) => (
                  <View
                    key={item.id}
                    style={[styles.deliveryRow, idx > 0 && styles.rowDivider]}
                  >
                    <View style={styles.deliveryThumb}>
                      <Ionicons
                        name="shirt-outline"
                        size={20}
                        color={colors.gold}
                      />
                    </View>
                    <View style={styles.deliveryInfo}>
                      <Text style={styles.deliveryTitle}>{item.title}</Text>
                      <Text style={styles.deliverySub}>
                        For: {item.customer_name}
                      </Text>
                    </View>
                    <View style={styles.deliveryMeta}>
                      <Badge
                        label={ORDER_STATUS_LABEL[item.status] ?? item.status}
                        tone={item.status === "ready" ? "success" : "warning"}
                      />
                      <Text style={styles.deliveryTime}>{item.time}</Text>
                    </View>
                  </View>
                ))
              )}
            </SectionCard>

            <Card style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <Text style={styles.cardTitle}>Business Analytics</Text>
                <View style={styles.toggle}>
                  <Pressable
                    onPress={() => setRange("week")}
                    style={[
                      styles.toggleChip,
                      range === "week" && styles.toggleChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleChipText,
                        range === "week" && styles.toggleChipTextActive,
                      ]}
                    >
                      Week
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setRange("month")}
                    style={[
                      styles.toggleChip,
                      range === "month" && styles.toggleChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleChipText,
                        range === "month" && styles.toggleChipTextActive,
                      ]}
                    >
                      Month
                    </Text>
                  </Pressable>
                </View>
              </View>
              <TrendChart
                values={data.analytics.map((point) => point.value)}
                width={CHART_WIDTH}
                height={110}
              />
              <View style={styles.dayRow}>
                {data.analytics
                  .filter(
                    (_, index) =>
                      range === "week" ||
                      index % 6 === 0 ||
                      index === data.analytics.length - 1,
                  )
                  .map((point) => (
                    <Text key={point.label} style={styles.dayLabel}>
                      {point.label}
                    </Text>
                  ))}
              </View>
            </Card>

            <SectionCard
              title="Appointments"
              onAdd={() => router.push("/(designer)/orders/new")}
            >
              {data.appointments.length === 0 ? (
                <Text style={styles.emptyText}>No appointments today.</Text>
              ) : (
                data.appointments.map((apt, idx) => (
                  <View
                    key={apt.id}
                    style={[styles.aptRow, idx > 0 && styles.rowDivider]}
                  >
                    <View style={styles.aptDot} />
                    <View style={styles.deliveryInfo}>
                      <Text style={styles.deliveryTime}>
                        {apt.starts_at} – {apt.ends_at}
                      </Text>
                      <Text style={styles.deliveryTitle}>{apt.title}</Text>
                      <Text style={styles.deliverySub}>
                        {apt.customer_name}
                      </Text>
                    </View>
                  </View>
                ))
              )}
              <Button
                label="View Calendar"
                variant="secondary"
                style={styles.calendarBtn}
                onPress={() => router.push("/(designer)/calendar")}
              />
            </SectionCard>

            <Text style={styles.sectionLabel}>Recent Clients</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.clientsRow}
            >
              {data.recent_clients.map((client) => (
                <Pressable
                  key={client.id}
                  style={styles.clientItem}
                  onPress={() =>
                    router.push(`/(designer)/customers/${client.id}`)
                  }
                >
                  <Avatar name={client.name} size={56} />
                  <Text style={styles.clientName} numberOfLines={1}>
                    {client.name.split(" ")[0]}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                style={styles.clientItem}
                onPress={() => router.push("/(designer)/customers/new")}
              >
                <View style={styles.addClientCircle}>
                  <Ionicons name="add" size={22} color={colors.gold} />
                </View>
                <Text style={styles.clientName}>New</Text>
              </Pressable>
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({
  title,
  onViewAll,
  onAdd,
  children,
}: {
  title: string;
  onViewAll?: () => void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        {onViewAll && (
          <Pressable onPress={onViewAll}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        )}
        {onAdd && (
          <Pressable onPress={onAdd} hitSlop={8}>
            <Ionicons name="add-circle-outline" size={20} color={colors.gold} />
          </Pressable>
        )}
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: 120, gap: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { ...typography.caption, color: colors.textSecondary },
  name: { ...typography.h2, color: colors.teal, marginTop: 2 },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.teal,
    borderRadius: 30,
    padding: spacing.xl,
    minHeight: 230,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: colors.teal,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueBlock: { flex: 1, minWidth: 0, paddingRight: spacing.md },
  heroEyebrow: { ...typography.label, color: "#AFC9C8" },
  revenueLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroValue: {
    ...typography.display,
    color: "#FFFFFF",
    marginTop: spacing.sm,
    fontSize: 30,
  },
  heroMeta: { ...typography.caption, color: "#C6D9D8", marginTop: spacing.xs },
  progressRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 8,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tealDark,
  },
  progressValue: { ...typography.bodyStrong, color: "#FFFFFF", fontSize: 18 },
  progressLabel: {
    ...typography.label,
    color: "#AFC9C8",
    fontSize: 8,
    marginTop: 1,
  },
  heroButton: {
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.goldLight,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  heroButtonText: { ...typography.bodyStrong, color: colors.teal },
  statsGrid: { flexDirection: "row", gap: spacing.md },
  rewardCard: {
    backgroundColor: colors.peach,
    gap: spacing.lg,
    borderColor: colors.peachStrong,
  },
  rewardTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardHeading: { flex: 1, minWidth: 0, paddingTop: 2 },
  rewardEyebrowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  rewardEyebrow: { ...typography.label, color: colors.goldDeep, fontSize: 9 },
  rewardTitle: { ...typography.label, color: colors.teal, marginTop: spacing.xs, lineHeight: 24 },
  rewardStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.42)",
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  rewardStat: { flex: 1, paddingHorizontal: spacing.md, minWidth: 0 },
  rewardStatDivider: { borderLeftWidth: 1, borderLeftColor: colors.peachStrong },
  rewardValue: { ...typography.h2, color: colors.textPrimary, fontSize: 18 },
  rewardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rewardProgress: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.peachStrong,
    overflow: "hidden",
  },
  rewardProgressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  rewardHint: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  rewardAction: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.tealMuted },
  rewardLink: { ...typography.bodyStrong, color: colors.teal },
  sectionLabel: { ...typography.h2, color: colors.teal, marginTop: spacing.sm },
  quickActions: { flexDirection: "row", gap: spacing.md },
  quickBtn: { flex: 1 },
  sectionCard: { gap: spacing.md },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { ...typography.bodyStrong, color: colors.teal, fontSize: 16 },
  viewAll: { ...typography.caption, color: colors.teal, fontWeight: "700" },
  emptyText: { ...typography.caption, color: colors.textSecondary },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  deliveryThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryInfo: { flex: 1, gap: 2 },
  deliveryTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 14,
  },
  deliverySub: { ...typography.caption, color: colors.textSecondary },
  deliveryMeta: { alignItems: "flex-end", gap: 6 },
  deliveryTime: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  analyticsCard: { gap: spacing.md },
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 3,
  },
  toggleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  toggleChipActive: { backgroundColor: colors.goldMuted },
  toggleChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  toggleChipTextActive: { color: colors.gold, fontWeight: "600" },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  dayLabel: { ...typography.caption, color: colors.textMuted, fontSize: 11 },
  aptRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  aptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginTop: 6,
  },
  calendarBtn: { marginTop: spacing.sm },
  clientsRow: { flexDirection: "row" },
  clientItem: {
    alignItems: "center",
    marginRight: spacing.lg,
    width: 60,
    gap: spacing.xs,
  },
  clientName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  addClientCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});
