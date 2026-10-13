import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FeatureHeader } from '../../src/components/FeatureHeader';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { FormSheet } from '../../src/components/FormSheet';
import { TextField } from '../../src/components/TextField';
import { Button } from '../../src/components/Button';
import { staffApi } from '../../src/api';
import { useAsync } from '../../src/hooks/useAsync';
import { useFeedback } from '../../src/context/FeedbackContext';
import { colors, spacing, typography } from '../../src/theme';

export default function Staff() {
  const { toast } = useFeedback(); const { data, refresh } = useAsync(() => staffApi.list(), [], true);
  const [open,setOpen]=useState(false), [name,setName]=useState(''), [role,setRole]=useState('Tailor'), [phone,setPhone]=useState('');
  const save=async()=>{ if(!name)return toast('Enter the staff member’s name.','error','Missing name'); try { await staffApi.create({name,role,phone,active:true}); setOpen(false); setName(''); refresh(); toast('Staff member added.','success'); } catch(e){toast(e instanceof Error?e.message:'Please try again.','error','Could not add staff');} };
  return <SafeAreaView style={s.safe}><FeatureHeader title="Staff" action={<Pressable onPress={()=>setOpen(true)}><Ionicons name="person-add" size={25} color={colors.gold}/></Pressable>}/><ScrollView contentContainerStyle={s.list}>{(data??[]).map(m=><Card key={m.id} style={s.card}><Avatar name={m.name}/><View style={{flex:1}}><Text style={s.name}>{m.name}</Text><Text style={s.sub}>{m.role} · {m.active?'Active':'Inactive'}</Text></View></Card>)}</ScrollView><FormSheet visible={open} title="Add Staff Member" onClose={()=>setOpen(false)}><TextField label="Full name" value={name} onChangeText={setName}/><TextField label="Role" value={role} onChangeText={setRole}/><TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad"/><Button label="Add Staff" onPress={save}/></FormSheet></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},list:{padding:spacing.xl,gap:spacing.md},card:{flexDirection:'row',alignItems:'center',gap:spacing.md},name:{...typography.bodyStrong,color:colors.teal},sub:{...typography.caption,color:colors.textSecondary,marginTop:3}});
