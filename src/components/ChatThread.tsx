import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { messagesApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';
import { ErrorState, LoadingState } from './StateViews';

export function ChatThread({ customerId, title }: { customerId?: number; title: string }) {
  const { user } = useAuth(); const [body,setBody]=useState(''); const [sending,setSending]=useState(false);
  const {data,loading,error,refresh}=useAsync(()=>messagesApi.thread(customerId),[customerId],true);
  const send=async()=>{if(!body.trim()||sending)return;setSending(true);try{await messagesApi.send(body.trim(),customerId);setBody('');refresh();}finally{setSending(false);}};
  return <SafeAreaView style={s.safe} edges={['top']}>
    <View style={s.header}><Pressable onPress={()=>router.back()}><Ionicons name="chevron-back" size={24} color={colors.teal}/></Pressable><Text style={s.title}>{title}</Text><View style={{width:24}}/></View>
    <KeyboardAvoidingView style={s.keyboardArea} behavior={Platform.OS==='ios'?'padding':'height'} keyboardVerticalOffset={0}>
      {loading&&!data&&<LoadingState label="Loading messages…"/>}{error&&!data&&<ErrorState message={error} onRetry={refresh}/>} 
      <FlatList style={s.messages} data={data??[]} keyExtractor={m=>String(m.id)} inverted contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS==='ios'?'interactive':'on-drag'}
        renderItem={({item})=>{const mine=item.sender_id===user?.id;return <View style={[s.bubble,mine?s.mine:s.theirs]}><Text style={[s.body,mine&&s.mineText]}>{item.body}</Text><Text style={[s.time,mine&&s.mineTime]}>{new Date(item.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</Text></View>}}/>
      <View style={s.composer}><TextInput value={body} onChangeText={setBody} placeholder="Write a message…" placeholderTextColor={colors.textMuted} multiline style={s.input}/><Pressable onPress={send} style={s.send}><Ionicons name="send" size={19} color="#fff"/></Pressable></View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},keyboardArea:{flex:1},messages:{flex:1},header:{height:60,paddingHorizontal:spacing.xl,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},title:{...typography.bodyStrong,color:colors.teal,fontSize:17},list:{padding:spacing.xl,gap:spacing.sm,flexDirection:'column-reverse'},bubble:{maxWidth:'80%',paddingHorizontal:spacing.lg,paddingVertical:spacing.md,borderRadius:radius.lg,marginBottom:spacing.sm},mine:{alignSelf:'flex-end',backgroundColor:colors.teal,borderBottomRightRadius:5},theirs:{alignSelf:'flex-start',backgroundColor:colors.surface,borderBottomLeftRadius:5},body:{...typography.body,color:colors.textPrimary},mineText:{color:'#fff'},time:{...typography.caption,color:colors.textMuted,fontSize:10,marginTop:4},mineTime:{color:'#BBD0CF'},composer:{flexDirection:'row',alignItems:'flex-end',gap:spacing.sm,padding:spacing.md,paddingBottom:spacing.lg,backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:colors.border},input:{flex:1,maxHeight:110,minHeight:48,borderRadius:radius.lg,backgroundColor:colors.background,paddingHorizontal:spacing.lg,paddingVertical:spacing.md,color:colors.textPrimary},send:{width:48,height:48,borderRadius:24,backgroundColor:colors.gold,alignItems:'center',justifyContent:'center'}});
