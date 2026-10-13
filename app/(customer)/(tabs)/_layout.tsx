import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme';

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={21} color={focused ? colors.teal : colors.textMuted} />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function CustomerTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: true, tabBarStyle: styles.tabBar, tabBarLabelStyle: styles.tabLabel, tabBarActiveTintColor: colors.teal, tabBarInactiveTintColor: colors.textMuted }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ focused }) => <TabIcon name="briefcase" focused={focused} /> }} />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Messages', tabBarIcon: ({ focused }) => <TabIcon name="chatbubble-ellipses" focused={focused} /> }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', left: 18, right: 18, bottom: 14, backgroundColor: colors.backgroundElevated,
    borderTopWidth: 0, height: 76, paddingTop: 6, paddingBottom: 7, borderRadius: 28, shadowColor: '#244B50',
    shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  iconWrap: { width: 42, height: 34, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.tealMuted },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gold, position: 'absolute', bottom: 3 },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 1 },
});
