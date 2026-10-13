import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Tone = 'success' | 'error' | 'info';
type DialogOptions = { title: string; message?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean };
type DialogState = DialogOptions & { resolve: (answer: boolean) => void };

interface FeedbackValue {
  toast: (message: string, tone?: Tone, title?: string) => void;
  alert: (options: DialogOptions) => Promise<void>;
  confirm: (options: DialogOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toastState, setToastState] = useState<{ message: string; title?: string; tone: Tone } | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const translateY = useRef(new Animated.Value(-140)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => Animated.timing(translateY, { toValue: -140, duration: 220, useNativeDriver: true }).start(() => setToastState(null)), [translateY]);
  const toast = useCallback((message: string, tone: Tone = 'info', title?: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToastState({ message, tone, title });
    translateY.setValue(-140);
    Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 180, useNativeDriver: true }).start();
    timer.current = setTimeout(dismissToast, 3800);
  }, [dismissToast, translateY]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const confirm = useCallback((options: DialogOptions) => new Promise<boolean>((resolve) => setDialog({ ...options, resolve })), []);
  const alert = useCallback(async (options: DialogOptions) => { await confirm({ ...options, cancelLabel: undefined }); }, [confirm]);
  const closeDialog = (answer: boolean) => { const current = dialog; setDialog(null); current?.resolve(answer); };
  const value = useMemo(() => ({ toast, alert, confirm }), [toast, alert, confirm]);
  const toneColor = toastState?.tone === 'error' ? colors.danger : toastState?.tone === 'success' ? colors.success : colors.teal;
  const toneIcon = toastState?.tone === 'error' ? 'alert-circle' : toastState?.tone === 'success' ? 'checkmark-circle' : 'information-circle';

  return <FeedbackContext.Provider value={value}>{children}
    {toastState ? <Animated.View accessibilityLiveRegion="polite" style={[styles.toast, { top: insets.top + 8, borderLeftColor: toneColor, transform: [{ translateY }] }]}>
      <Ionicons name={toneIcon} size={24} color={toneColor} /><View style={styles.toastCopy}>{toastState.title ? <Text style={styles.toastTitle}>{toastState.title}</Text> : null}<Text style={styles.toastMessage}>{toastState.message}</Text></View><Pressable accessibilityLabel="Dismiss message" onPress={dismissToast}><Ionicons name="close" size={20} color={colors.textMuted} /></Pressable>
    </Animated.View> : null}
    <Modal transparent visible={!!dialog} animationType="fade" statusBarTranslucent onRequestClose={() => closeDialog(false)}>
      <View style={styles.backdrop}><Pressable style={StyleSheet.absoluteFill} onPress={() => closeDialog(false)} /><View style={styles.dialog}>
        <View style={[styles.dialogIcon, dialog?.destructive && styles.dialogIconDanger]}><Ionicons name={dialog?.destructive ? 'warning-outline' : 'sparkles-outline'} size={27} color={dialog?.destructive ? colors.danger : colors.goldDeep} /></View>
        <Text style={styles.dialogTitle}>{dialog?.title}</Text>{dialog?.message ? <Text style={styles.dialogMessage}>{dialog.message}</Text> : null}
        <View style={styles.dialogActions}>{dialog?.cancelLabel ? <Pressable style={styles.secondary} onPress={() => closeDialog(false)}><Text style={styles.secondaryText}>{dialog.cancelLabel}</Text></Pressable> : null}<Pressable style={[styles.primary, dialog?.destructive && styles.primaryDanger]} onPress={() => closeDialog(true)}><Text style={styles.primaryText}>{dialog?.confirmLabel ?? 'Okay'}</Text></Pressable></View>
      </View></View>
    </Modal>
  </FeedbackContext.Provider>;
}

export function useFeedback() { const value = useContext(FeedbackContext); if (!value) throw new Error('useFeedback must be used inside FeedbackProvider'); return value; }

const styles = StyleSheet.create({toast:{position:'absolute',zIndex:999,left:spacing.lg,right:spacing.lg,minHeight:66,flexDirection:'row',alignItems:'center',gap:12,padding:14,backgroundColor:colors.surface,borderRadius:radius.lg,borderLeftWidth:4,...shadow.card},toastCopy:{flex:1},toastTitle:{...typography.bodyStrong,color:colors.textPrimary,marginBottom:2},toastMessage:{...typography.caption,color:colors.textSecondary,lineHeight:18},backdrop:{flex:1,backgroundColor:'#0B353C99',alignItems:'center',justifyContent:'center',padding:spacing.xl},dialog:{width:'100%',maxWidth:390,backgroundColor:colors.surface,borderRadius:28,padding:26,alignItems:'center',...shadow.card},dialogIcon:{width:58,height:58,borderRadius:20,backgroundColor:colors.goldMuted,alignItems:'center',justifyContent:'center',marginBottom:18},dialogIconDanger:{backgroundColor:colors.dangerMuted},dialogTitle:{...typography.h1,color:colors.textPrimary,textAlign:'center'},dialogMessage:{...typography.body,color:colors.textSecondary,textAlign:'center',lineHeight:22,marginTop:10},dialogActions:{width:'100%',flexDirection:'row',gap:10,marginTop:25},secondary:{flex:1,height:50,borderRadius:radius.pill,borderWidth:1,borderColor:colors.borderStrong,alignItems:'center',justifyContent:'center'},secondaryText:{...typography.bodyStrong,color:colors.textPrimary},primary:{flex:1,height:50,borderRadius:radius.pill,backgroundColor:colors.gold,alignItems:'center',justifyContent:'center'},primaryDanger:{backgroundColor:colors.danger},primaryText:{...typography.bodyStrong,color:'#fff'}});
