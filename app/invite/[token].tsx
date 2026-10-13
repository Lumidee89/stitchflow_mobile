import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { invitationsApi } from '../../src/api';
import { ApiError } from '../../src/api/client';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { ErrorState, LoadingState } from '../../src/components/StateViews';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import type { CustomerInvitation } from '../../src/types';
import { colors, radius, shadow, spacing, typography } from '../../src/theme';

export default function AcceptInvitationScreen() {
  const { token = '' } = useLocalSearchParams<{ token: string }>();
  const { completeInvitation } = useAuth(); const { toast } = useFeedback();
  const [invite,setInvite]=useState<CustomerInvitation|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[submitting,setSubmitting]=useState(false);
  const load=()=>{setLoading(true);setError('');invitationsApi.get(token).then(data=>{setInvite(data);setName(data.customer_name);setEmail(data.email)}).catch(e=>setError(e instanceof Error?e.message:'Invitation unavailable.')).finally(()=>setLoading(false))};
  useEffect(load,[token]);
  const accept=async()=>{if(!name||!email||!password||!confirmation)return toast('Complete all fields to continue.','error','Missing details');if(password!==confirmation)return toast('The passwords do not match.','error','Check your password');setSubmitting(true);try{const session=await invitationsApi.accept(token,{name,email,password,password_confirmation:confirmation});await completeInvitation(session);toast('Your designer workspace is ready.','success','Welcome to StitchFlow');router.replace('/(customer)/home')}catch(e){toast(e instanceof ApiError?e.message:'Please try again.','error','Could not accept invitation')}finally{setSubmitting(false)}};
  if(loading)return <SafeAreaView style={s.safe}><LoadingState label="Opening your invitation…"/></SafeAreaView>;
  if(error||!invite)return <SafeAreaView style={s.safe}><ErrorState message={error||'Invitation unavailable.'} onRetry={load}/></SafeAreaView>;
  const atelier=invite.designer.business_name||invite.designer.name;
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.safe} behavior={Platform.OS==='ios'?'padding':'height'}><ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
    <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain"/><Text style={s.eyebrow}>PRIVATE CLIENT INVITATION</Text><Text style={s.title}>Welcome to{`\n`}{atelier}.</Text><Text style={s.body}>Your designer has already prepared your client profile. Create or confirm your login to see your existing orders, measurements and messages.</Text>
    <View style={s.inviteCard}><View style={s.icon}><Ionicons name="shirt-outline" size={24} color={colors.goldDeep}/></View><View style={{flex:1}}><Text style={s.client}>{invite.customer_name}</Text><Text style={s.expiry}>Invitation expires {new Date(invite.expires_at).toLocaleDateString()}</Text></View></View>
    <View style={s.form}><TextField label="Full name" value={name} onChangeText={setName}/><TextField label="Invited email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/><TextField label="Password" value={password} onChangeText={setPassword} isPassword/><TextField label="Confirm password" value={confirmation} onChangeText={setConfirmation} isPassword/><Text style={s.hint}>Already have a client account? Enter its existing password and StitchFlow will add this atelier to it.</Text><Button label="Join Designer Workspace" onPress={accept} loading={submitting}/></View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},scroll:{padding:spacing.xl,paddingBottom:100},logo:{width:82,height:82,marginBottom:spacing.lg},eyebrow:{...typography.label,color:colors.goldDeep},title:{...typography.display,color:colors.teal,fontSize:38,lineHeight:42,marginTop:10},body:{...typography.body,color:colors.textSecondary,lineHeight:23,marginTop:14},inviteCard:{flexDirection:'row',alignItems:'center',gap:14,backgroundColor:colors.surface,borderRadius:radius.xl,padding:spacing.lg,marginVertical:spacing.xl,...shadow.card},icon:{width:48,height:48,borderRadius:16,backgroundColor:colors.goldMuted,alignItems:'center',justifyContent:'center'},client:{...typography.bodyStrong,color:colors.textPrimary},expiry:{...typography.caption,color:colors.textMuted,marginTop:4},form:{gap:2},hint:{...typography.caption,color:colors.textMuted,lineHeight:18,marginBottom:spacing.lg}});
