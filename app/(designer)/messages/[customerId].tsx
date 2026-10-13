import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChatThread } from '../../../src/components/ChatThread';
export default function DesignerChat(){const p=useLocalSearchParams<{customerId:string;name?:string}>();return <ChatThread customerId={Number(p.customerId)} title={p.name??'Client'}/>;}
