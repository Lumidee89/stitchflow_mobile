import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../src/components/Avatar';
import { Card } from '../../../src/components/Card';
import { EmptyState, ErrorState, LoadingState } from '../../../src/components/StateViews';
import { TextField } from '../../../src/components/TextField';
import { customersApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, spacing, typography } from '../../../src/theme';

export default function CustomersScreen() {
  const [query, setQuery] = useState('');
  const { data, loading, error, refresh } = useAsync(() => customersApi.list(), [], true);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((c) => c.name.toLowerCase().includes(q) || c.phone?.includes(q));
  }, [data, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Clients</Text>
        <Pressable onPress={() => router.push('/(designer)/customers/new')} hitSlop={10}>
          <Ionicons name="person-add-outline" size={22} color={colors.gold} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <TextField label="" icon="search-outline" placeholder="Search clients" value={query} onChangeText={setQuery} />
      </View>

      {loading && !data && <LoadingState label="Loading clients…" />}
      {error && !data && <ErrorState message={error} onRetry={refresh} />}
      {data && filtered.length === 0 && (
        <EmptyState icon="people-outline" title="No clients yet" message="Add your first client to get started." />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={loading && !!data}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(designer)/customers/${item.id}`)}>
            <Card style={styles.row}>
              <Avatar name={item.name} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.phone ?? item.email ?? 'No contact info'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Card>
          </Pressable>
        )}
      />
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
  searchWrap: { paddingHorizontal: spacing.xl },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1 },
  name: { ...typography.bodyStrong, color: colors.textPrimary },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
