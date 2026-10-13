import React, { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { ErrorState, LoadingState } from '../../../src/components/StateViews';
import { customersApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, spacing, typography } from '../../../src/theme';
import { useFeedback } from '../../../src/context/FeedbackContext';

export default function CustomerDetailScreen() {
  const { alert, toast, confirm } = useFeedback();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = Number(id);
  const [tab, setTab] = useState<'overview' | 'measurements'>('overview');
  const [inviting, setInviting] = useState(false);

  const { data: customer, loading, error, refresh } = useAsync(() => customersApi.get(customerId), [customerId]);
  const { data: measurements } = useAsync(() => customersApi.measurements(customerId), [customerId]);
  const inviteClient = async () => {
    if (!customer?.email) return toast('Add an email address to this client profile before inviting them.', 'error', 'Email required');
    setInviting(true);
    try {
      const invitation = await customersApi.invite(customerId, customer.email);
      await Share.share({ title: 'Your StitchFlow invitation', message: `Hi ${customer.name}, your designer has invited you to StitchFlow. Open this secure link to access your orders, measurements and messages:\n\n${invitation.invite_url}` });
      refresh();
      toast('The invitation is ready to share and expires in seven days.', 'success', 'Invitation created');
    } catch (e) { toast(e instanceof Error ? e.message : 'Please try again.', 'error', 'Could not create invitation'); }
    finally { setInviting(false); }
  };
  const revokeInvite = async () => { if (!(await confirm({title:'Revoke invitation?',message:'The current invitation link will stop working immediately.',confirmLabel:'Revoke',cancelLabel:'Keep It',destructive:true}))) return; try{await customersApi.revokeInvitation(customerId);refresh();toast('The invitation link has been revoked.','success')}catch(e){toast(e instanceof Error?e.message:'Please try again.','error','Could not revoke')}};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Client Profile</Text>
        <Pressable onPress={() => router.push('/(designer)/orders/new')} hitSlop={10}>
          <Ionicons name="add-circle-outline" size={22} color={colors.gold} />
        </Pressable>
      </View>

      {loading && !customer && <LoadingState label="Loading client…" />}
      {error && !customer && <ErrorState message={error} onRetry={refresh} />}

      {customer && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.profileHeader}>
            <Avatar name={customer.name} size={72} />
            <Text style={styles.name}>{customer.name}</Text>
            {!!customer.phone && <Text style={styles.contact}>{customer.phone}</Text>}
            <View style={styles.badgeRow}>
              <Badge label={`${customer.loyalty_points} loyalty pts`} tone="gold" />
              {!!customer.birthday && <Badge label={`Birthday: ${customer.birthday}`} tone="info" />}
            </View>
          </View>

          <View style={styles.tabs}>
            <Pressable onPress={() => setTab('overview')} style={[styles.tab, tab === 'overview' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'overview' && styles.tabTextActive]}>Overview</Text>
            </Pressable>
            <Pressable onPress={() => setTab('measurements')} style={[styles.tab, tab === 'measurements' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'measurements' && styles.tabTextActive]}>Measurements</Text>
            </Pressable>
          </View>

          {tab === 'overview' && (
            <><Card style={styles.card}>
              <Text style={styles.cardTitle}>Notes</Text>
              <Text style={styles.notes}>{customer.notes || 'No notes yet for this client.'}</Text>
            </Card>{customer.has_account ? <Card style={styles.connected}><Ionicons name="checkmark-circle" size={23} color={colors.success}/><View style={{flex:1}}><Text style={styles.connectedTitle}>Client connected</Text><Text style={styles.connectedText}>This client can access their orders and messages.</Text></View></Card> : <><Button label={customer.invitation?.status==='pending'?'Resend Invitation':'Invite Client to StitchFlow'} onPress={inviteClient} loading={inviting} icon={<Ionicons name="paper-plane-outline" size={18} color="#fff"/>}/>{customer.invitation?.status==='pending'&&<Pressable onPress={revokeInvite} style={styles.revoke}><Text style={styles.revokeText}>Revoke current invitation</Text></Pressable>}</>}</>
          )}

          {tab === 'measurements' && (
            <Card style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.cardTitle}>Measurement History</Text>
                <Pressable
                  onPress={() =>
                    alert({ title: 'Add Measurement', message: 'Create an order for this client to add or update their measurements.' })
                  }
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.gold} />
                </Pressable>
              </View>
              {(measurements ?? []).length === 0 && (
                <Text style={styles.emptyText}>No measurements recorded yet.</Text>
              )}
              {(measurements ?? []).map((m) => (
                <View key={m.id} style={styles.measurementRow}>
                  <View style={styles.measurementHeaderRow}>
                    <Text style={styles.measurementType}>
                      {m.type.charAt(0).toUpperCase() + m.type.slice(1)} · v{m.version}
                    </Text>
                    <Text style={styles.measurementDate}>{new Date(m.created_at).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.fieldsGrid}>
                    {Object.entries(m.fields).map(([key, value]) => (
                      <View key={key} style={styles.fieldChip}>
                        <Text style={styles.fieldKey}>{key}</Text>
                        <Text style={styles.fieldValue}>{value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </Card>
          )}

          <Button
            label="Create Order for Client"
            variant="secondary"
            style={styles.orderBtn}
            onPress={() => router.push('/(designer)/orders/new')}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 16 },
  scroll: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl * 2 },
  profileHeader: { alignItems: 'center', gap: spacing.xs },
  name: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm },
  contact: { ...typography.caption, color: colors.textSecondary },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  connected:{flexDirection:'row',alignItems:'center',gap:spacing.md,backgroundColor:colors.successMuted},connectedTitle:{...typography.bodyStrong,color:colors.success},connectedText:{...typography.caption,color:colors.textSecondary,marginTop:2},
  revoke:{alignItems:'center',padding:spacing.sm},revokeText:{...typography.caption,color:colors.danger,fontWeight:'600'},
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.goldMuted },
  tabText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.gold },
  card: { gap: spacing.sm },
  cardTitle: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 16 },
  notes: { ...typography.body, color: colors.textSecondary },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyText: { ...typography.caption, color: colors.textSecondary },
  measurementRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.sm, gap: spacing.sm },
  measurementHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  measurementType: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 14 },
  measurementDate: { ...typography.caption, color: colors.textMuted },
  fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fieldChip: { backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  fieldKey: { ...typography.caption, color: colors.textMuted, fontSize: 10, textTransform: 'uppercase' },
  fieldValue: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 13 },
  orderBtn: { marginTop: spacing.sm },
});
