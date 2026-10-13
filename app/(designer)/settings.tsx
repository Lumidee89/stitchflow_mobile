import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeatureHeader } from '../../src/components/FeatureHeader';
import { TextField } from '../../src/components/TextField';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useAuth } from '../../src/context/AuthContext';
import { settingsApi } from '../../src/api';
import { ApiError } from '../../src/api/client';
import { colors, spacing, typography } from '../../src/theme';
import { useFeedback } from '../../src/context/FeedbackContext';
import { router } from 'expo-router';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useFeedback();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [business, setBusiness] = useState(user?.business_name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await settingsApi.update({ name, phone, business_name: business });
      toast('Your business settings were updated.', 'success', 'Saved');
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Please try again.', 'error', 'Could not save');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return toast('Complete all password fields.', 'error', 'Missing details');
    if (newPassword !== confirmPassword) return toast('Confirm your new password again.', 'error', 'Passwords do not match');
    setChangingPassword(true);
    try {
      await settingsApi.update({ current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast('Use your new password the next time you sign in.', 'success', 'Password changed');
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Please try again.', 'error', 'Could not change password');
    } finally { setChangingPassword(false); }
  };

  return <SafeAreaView style={styles.safe}>
    <FeatureHeader title="Settings" />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Card>
          <Text style={styles.sectionTitle}>Business profile</Text>
          <TextField label="Your name" value={name} onChangeText={setName} />
          <TextField label="Business name" value={business} onChangeText={setBusiness} />
          <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField label="Email" value={user?.email ?? ''} editable={false} />
          <Button label="Save Changes" onPress={saveProfile} loading={saving} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Change password</Text>
          <Text style={styles.hint}>Enter your current password before choosing a new one.</Text>
          <TextField label="Current password" value={currentPassword} onChangeText={setCurrentPassword} isPassword />
          <TextField label="New password" value={newPassword} onChangeText={setNewPassword} isPassword />
          <TextField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} isPassword />
          <Button label="Change Password" onPress={changePassword} loading={changingPassword} variant="secondary" />
        </Card>
        <Card><Text style={styles.sectionTitle}>Privacy & security</Text><Text style={styles.hint}>Manage active sessions, export your information, review policies or delete your account.</Text><Button label="Open account controls" onPress={()=>router.push('/account-security')} variant="secondary" /></Card>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  form: { padding: spacing.xl, paddingBottom: 160, gap: spacing.lg },
  sectionTitle: { ...typography.h2, color: colors.teal, marginBottom: spacing.lg },
  hint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
});
