import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../src/components/Button';
import { TextField } from '../../../src/components/TextField';
import { customersApi } from '../../../src/api';
import { colors, spacing, typography } from '../../../src/theme';
import { useFeedback } from '../../../src/context/FeedbackContext';

export default function NewCustomerScreen() {
  const { toast } = useFeedback();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [measurementConsent,setMeasurementConsent]=useState(false); const [photoConsent,setPhotoConsent]=useState(false);

  const onSubmit = async () => {
    if (!name || !measurementConsent) {
      toast(!name?'Enter the client’s name to continue.':'Confirm the client has agreed to measurement storage.', 'error', 'Consent required');
      return;
    }
    setSaving(true);
    try {
      const customer = await customersApi.create({ name, phone, email, birthday: birthday || null, notes, measurement_consent:measurementConsent,photograph_consent:photoConsent });
      router.replace(`/(designer)/customers/${customer.id}`);
    } catch (err: any) {
      toast(err?.message ?? 'Please try again.', 'error', 'Could not add client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Client</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
        >
          <TextField label="Full Name" placeholder="Jane Doe" value={name} onChangeText={setName} />
          <TextField label="Phone Number" placeholder="+1 (555) 000-0000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextField label="Email Address" placeholder="jane@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextField label="Birthday" placeholder="YYYY-MM-DD" value={birthday} onChangeText={setBirthday} />
          <TextField label="Notes" placeholder="Preferences, sizing notes…" value={notes} onChangeText={setNotes} multiline />
          <ConsentRow checked={measurementConsent} onPress={()=>setMeasurementConsent(v=>!v)} title="Measurement consent" text="The client agrees that this designer may securely store and use their measurements for garment orders." required/>
          <ConsentRow checked={photoConsent} onPress={()=>setPhotoConsent(v=>!v)} title="Photograph consent" text="The client agrees that garment or fitting photographs may be stored in StitchFlow."/>

          <Button label="Add Client" onPress={onSubmit} loading={saving} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ConsentRow({checked,onPress,title,text,required}:{checked:boolean;onPress:()=>void;title:string;text:string;required?:boolean}){return <Pressable onPress={onPress} style={styles.consent}><Ionicons name={checked?'checkbox':'square-outline'} size={24} color={checked?colors.teal:colors.textMuted}/><View style={{flex:1}}><Text style={styles.consentTitle}>{title}{required?' *':''}</Text><Text style={styles.consentText}>{text}</Text></View></Pressable>}

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
  scroll: { padding: spacing.xl, paddingBottom: 180 },
  submit: { marginTop: spacing.md },
  consent:{flexDirection:'row',gap:spacing.md,padding:spacing.lg,backgroundColor:colors.surface,borderRadius:16,marginBottom:spacing.md},consentTitle:{...typography.bodyStrong,color:colors.textPrimary},consentText:{...typography.caption,color:colors.textSecondary,marginTop:4,lineHeight:18},
});
