import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Avatar } from '../../../src/components/Avatar';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { TextField } from '../../../src/components/TextField';
import { customersApi, ordersApi } from '../../../src/api';
import { useAsync } from '../../../src/hooks/useAsync';
import { colors, radius, spacing, typography } from '../../../src/theme';
import type { Customer, DeliveryPromise, Measurement } from '../../../src/types';
import { useFeedback } from '../../../src/context/FeedbackContext';

const MEASUREMENT_FIELDS = ['chest', 'waist', 'hip', 'shoulder', 'sleeve_length', 'outseam', 'inseam', 'neck'];
const FIELD_LABELS: Record<string, string> = { chest:'Chest',waist:'Waist',hip:'Hip',shoulder:'Shoulder',sleeve_length:'Sleeve length',outseam:'Outseam',inseam:'Inseam',neck:'Neck' };

export default function NewOrderScreen() {
  const { toast } = useFeedback();
  const { data: customers } = useAsync(() => customersApi.list(), []);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [measurementId, setMeasurementId] = useState<number | null>(null);
  const [measurementType, setMeasurementType] = useState<Measurement['type']>('male');
  const [measurementFields, setMeasurementFields] = useState<Record<string,string>>({});
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [measurementDirty, setMeasurementDirty] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); const [dueDate, setDueDate] = useState<Date | null>(null);
  const [complexity,setComplexity]=useState<'simple'|'standard'|'complex'>('standard'); const [promise,setPromise]=useState<DeliveryPromise|null>(null); const [predicting,setPredicting]=useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); const [saving, setSaving] = useState(false);

  const selectCustomer = async (customer: Customer) => {
    setCustomerId(customer.id); setSelectedCustomer(customer); setLoadingCustomer(true); setMeasurementDirty(false);
    if (!title.trim()) setTitle(`${customer.name.split(' ')[0]}'s Outfit`);
    if (!description.trim() && customer.notes) setDescription(customer.notes);
    try {
      const versions = await customersApi.measurements(customer.id); const latest = versions[0];
      if (latest) {
        setMeasurementId(latest.id); setMeasurementType(latest.type);
        setMeasurementFields(Object.fromEntries(Object.entries(latest.fields).map(([key,value])=>[key,String(value)])));
        setMeasurementNotes(latest.notes ?? '');
      } else { setMeasurementId(null); setMeasurementFields({}); setMeasurementNotes(''); }
    } catch { setMeasurementId(null); setMeasurementFields({}); }
    finally { setLoadingCustomer(false); }
  };

  const changeMeasurement = (key:string,value:string) => { setMeasurementFields(current=>({...current,[key]:value})); setMeasurementDirty(true); };
  const getSmartDate=async(next=complexity)=>{setPredicting(true);try{const result=await ordersApi.deliveryPromise(next);setPromise(result);setDueDate(new Date(`${result.suggested_date}T12:00:00`));}catch(err:any){toast(err?.message??'Could not calculate a delivery date.','error');}finally{setPredicting(false)}};
  const onSubmit = async () => {
    if (!customerId || !title || !price) return toast('Select a customer, and enter a title and price.', 'error', 'Missing details');
    setSaving(true);
    try {
      const cleanFields = Object.fromEntries(Object.entries(measurementFields).filter(([,v])=>v.trim()!=='').map(([k,v])=>[k,Number(v)||v]));
      let savedMeasurementId = measurementId;
      if (Object.keys(cleanFields).length && (measurementDirty || !measurementId)) {
        const measurement = await customersApi.addMeasurement(customerId, { type: measurementType, fields: cleanFields, notes: measurementNotes });
        savedMeasurementId = measurement.id;
      }
      const order = await ordersApi.create({ customer_id: customerId, measurement_id: savedMeasurementId,
        measurement_snapshot: Object.keys(cleanFields).length ? { type: measurementType, fields: cleanFields, notes: measurementNotes } : null,
        title, description, complexity, price: Number(price), due_date: dueDate ? formatDateForApi(dueDate) : null });
      router.replace(`/(designer)/orders/${order.id}`);
    } catch (err:any) { toast(err?.message ?? 'Please try again.', 'error', 'Could not create order'); }
    finally { setSaving(false); }
  };

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}><Pressable onPress={()=>router.back()} hitSlop={10}><Ionicons name="chevron-back" size={24} color={colors.teal}/></Pressable><Text style={styles.headerTitle}>New Order</Text><View style={{width:24}}/></View>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS==='ios'?'interactive':'on-drag'} automaticallyAdjustKeyboardInsets>
        <Text style={styles.label}>SELECT CLIENT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerRow}>
          {(customers??[]).map(c=><Pressable key={c.id} onPress={()=>selectCustomer(c)} style={styles.customerItem}><View style={[styles.avatarRing,customerId===c.id&&styles.avatarRingActive]}><Avatar name={c.name} size={52}/></View><Text style={styles.customerName} numberOfLines={1}>{c.name.split(' ')[0]}</Text></Pressable>)}
          <Pressable style={styles.customerItem} onPress={()=>router.push('/(designer)/customers/new')}><View style={styles.addCircle}><Ionicons name="add" size={20} color={colors.gold}/></View><Text style={styles.customerName}>New</Text></Pressable>
        </ScrollView>

        {selectedCustomer && <Card style={styles.clientCard}><View style={styles.clientHeading}><View><Text style={styles.clientName}>{selectedCustomer.name}</Text><Text style={styles.clientCaption}>Client details filled automatically</Text></View><Ionicons name="checkmark-circle" size={24} color={colors.success}/></View><View style={styles.contactRow}><Ionicons name="call-outline" size={16} color={colors.teal}/><Text style={styles.contactText}>{selectedCustomer.phone || 'No phone saved'}</Text></View><View style={styles.contactRow}><Ionicons name="mail-outline" size={16} color={colors.teal}/><Text style={styles.contactText}>{selectedCustomer.email || 'No email saved'}</Text></View></Card>}

        <TextField label="Order Title" placeholder="Navy Wool Blend Suit" value={title} onChangeText={setTitle}/>
        <TextField label="Description" placeholder="Style notes, fabric, occasion…" value={description} onChangeText={setDescription} multiline/>
        <TextField label="Price (₦)" placeholder="0.00" keyboardType="decimal-pad" value={price} onChangeText={setPrice}/>
        <Text style={styles.inputLabel}>GARMENT COMPLEXITY</Text>
        <View style={styles.typeRow}>{(['simple','standard','complex'] as const).map(type=><Pressable key={type} onPress={()=>{setComplexity(type);setPromise(null)}} style={[styles.typeChip,complexity===type&&styles.typeChipActive]}><Text style={[styles.typeText,complexity===type&&styles.typeTextActive]}>{type[0].toUpperCase()+type.slice(1)}</Text></Pressable>)}</View>
        <Button label={predicting?'Calculating…':'Suggest a smart delivery date'} onPress={()=>getSmartDate()} disabled={predicting} variant="secondary" />
        {promise&&<Card style={styles.promiseCard}><View style={styles.clientHeading}><Text style={styles.sectionTitle}>{promise.confidence}% confidence</Text><BadgeRisk risk={promise.risk}/></View><Text style={styles.clientCaption}>{promise.reason}</Text></Card>}
        <Text style={styles.inputLabel}>DUE DATE</Text>
        <Pressable style={styles.dateField} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.teal}/>
          <Text style={[styles.dateText,!dueDate&&styles.datePlaceholder]}>{dueDate ? dueDate.toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'long',year:'numeric'}) : 'Select delivery date'}</Text>
          {dueDate ? <Pressable onPress={(event)=>{event.stopPropagation();setDueDate(null)}} hitSlop={10}><Ionicons name="close-circle" size={20} color={colors.textMuted}/></Pressable> : <Ionicons name="chevron-down" size={18} color={colors.textMuted}/>} 
        </Pressable>
        {showDatePicker && <View style={styles.pickerWrap}>
          <DateTimePicker value={dueDate??new Date()} mode="date" display={Platform.OS==='ios'?'inline':'calendar'} minimumDate={new Date()} onChange={(event,date)=>{if(Platform.OS==='android')setShowDatePicker(false);if(event.type==='set'&&date)setDueDate(date)}}/>
          {Platform.OS==='ios'&&<Pressable style={styles.pickerDone} onPress={()=>setShowDatePicker(false)}><Text style={styles.pickerDoneText}>Done</Text></Pressable>}
        </View>}

        {selectedCustomer && <Card style={styles.measureCard}><View style={styles.measureHeader}><View><Text style={styles.sectionTitle}>Measurements</Text><Text style={styles.clientCaption}>{loadingCustomer?'Loading saved measurements…':measurementId?'Latest saved sheet loaded':'No saved sheet — add measurements below'}</Text></View><Ionicons name="resize-outline" size={22} color={colors.gold}/></View>
          <View style={styles.typeRow}>{(['male','female','children'] as const).map(type=><Pressable key={type} onPress={()=>{setMeasurementType(type);setMeasurementDirty(true)}} style={[styles.typeChip,measurementType===type&&styles.typeChipActive]}><Text style={[styles.typeText,measurementType===type&&styles.typeTextActive]}>{type[0].toUpperCase()+type.slice(1)}</Text></Pressable>)}</View>
          {MEASUREMENT_FIELDS.map(field=><TextField key={field} label={`${FIELD_LABELS[field]} (inches)`} placeholder="0" keyboardType="decimal-pad" value={measurementFields[field]??''} onChangeText={value=>changeMeasurement(field,value)}/>)}
          <TextField label="Measurement notes" placeholder="Posture, preferred fit, allowances…" value={measurementNotes} onChangeText={value=>{setMeasurementNotes(value);setMeasurementDirty(true)}} multiline/>
        </Card>}
        <Button label="Create Order" onPress={onSubmit} loading={saving} style={styles.submit}/>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function BadgeRisk({risk}:{risk:'low'|'medium'|'high'}){return <View style={{backgroundColor:risk==='low'?colors.successMuted:colors.goldMuted,borderRadius:radius.pill,paddingHorizontal:spacing.md,paddingVertical:spacing.xs}}><Text style={{...typography.caption,color:risk==='low'?colors.success:colors.warning,fontWeight:'700'}}>{risk.toUpperCase()} RISK</Text></View>}

function formatDateForApi(date:Date){const year=date.getFullYear();const month=String(date.getMonth()+1).padStart(2,'0');const day=String(date.getDate()).padStart(2,'0');return `${year}-${month}-${day}`;}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:spacing.xl,paddingVertical:spacing.md},headerTitle:{...typography.bodyStrong,color:colors.teal,fontSize:16},scroll:{padding:spacing.xl,paddingBottom:180},label:{...typography.label,color:colors.textSecondary,marginBottom:spacing.md},inputLabel:{...typography.label,color:colors.textSecondary,marginBottom:spacing.sm},dateField:{minHeight:56,borderRadius:radius.lg,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,paddingHorizontal:spacing.lg,flexDirection:'row',alignItems:'center',gap:spacing.md,marginBottom:spacing.lg},dateText:{...typography.body,color:colors.textPrimary,flex:1},datePlaceholder:{color:colors.textMuted},pickerWrap:{backgroundColor:colors.surface,borderRadius:radius.xl,padding:spacing.md,marginTop:-spacing.sm,marginBottom:spacing.lg},pickerDone:{alignSelf:'flex-end',backgroundColor:colors.teal,borderRadius:radius.pill,paddingHorizontal:spacing.xl,paddingVertical:spacing.sm},pickerDoneText:{...typography.bodyStrong,color:'#fff'},customerRow:{marginBottom:spacing.xl},customerItem:{alignItems:'center',marginRight:spacing.lg,width:60,gap:spacing.xs},avatarRing:{borderRadius:30,borderWidth:2,borderColor:'transparent'},avatarRingActive:{borderColor:colors.gold},customerName:{...typography.caption,color:colors.textSecondary,fontSize:12},addCircle:{width:52,height:52,borderRadius:26,borderWidth:1,borderColor:colors.borderStrong,borderStyle:'dashed',alignItems:'center',justifyContent:'center'},clientCard:{marginBottom:spacing.xl,backgroundColor:colors.tealMuted,gap:spacing.sm},clientHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},clientName:{...typography.bodyStrong,color:colors.teal,fontSize:17},clientCaption:{...typography.caption,color:colors.textSecondary,marginTop:3},contactRow:{flexDirection:'row',alignItems:'center',gap:spacing.sm},contactText:{...typography.caption,color:colors.textPrimary},measureCard:{marginTop:spacing.sm,marginBottom:spacing.xl},measureHeader:{flexDirection:'row',justifyContent:'space-between',marginBottom:spacing.lg},sectionTitle:{...typography.h2,color:colors.teal},typeRow:{flexDirection:'row',gap:spacing.sm,marginBottom:spacing.xl},typeChip:{flex:1,paddingVertical:spacing.sm,borderRadius:radius.pill,backgroundColor:colors.surfaceAlt,alignItems:'center'},typeChipActive:{backgroundColor:colors.teal},typeText:{...typography.caption,color:colors.textSecondary},typeTextActive:{color:'#fff',fontWeight:'700'},promiseCard:{backgroundColor:colors.tealMuted,marginVertical:spacing.lg},submit:{marginTop:spacing.md}});
