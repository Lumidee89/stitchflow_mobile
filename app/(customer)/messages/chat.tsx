import React from 'react';
import { ChatThread } from '../../../src/components/ChatThread';
import { useLocalSearchParams } from 'expo-router';
export default function CustomerChat(){const p=useLocalSearchParams<{customerId?:string;name?:string}>();return <ChatThread customerId={p.customerId?Number(p.customerId):undefined} title={p.name??"My Designer"}/>;}
