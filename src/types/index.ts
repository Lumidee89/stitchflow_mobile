export type Role = 'designer' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  business_name?: string | null;
  avatar_url?: string | null;
  email_verified: boolean;
  token_expires_at?: string|null;
  subscription: SubscriptionStatus;
}

export interface SubscriptionPlan { id: 'monthly' | 'annual'; name: string; amount: number; amount_kobo: number; months: number; }
export interface SubscriptionStatus {
  required: boolean;
  has_access: boolean;
  on_trial: boolean;
  trial_ends_at?: string | null;
  plan?: 'monthly' | 'annual' | null;
  status?: 'pending' | 'active' | 'expired' | 'cancelled' | null;
  ends_at?: string | null;
  subscription?: { plan: 'monthly' | 'annual'; status: string; ends_at: string | null } | null;
}

export interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  birthday?: string | null;
  loyalty_points: number;
  measurement_consent?:boolean;
  photograph_consent?:boolean;
  has_account?: boolean;
  invitation?: { status: 'pending' | 'accepted' | 'revoked' | 'expired'; expires_at: string } | null;
  created_at: string;
}

export interface Measurement {
  id: number;
  customer_id: number;
  type: 'male' | 'female' | 'children';
  fields: Record<string, string | number>;
  version: number;
  notes?: string | null;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'measurement'
  | 'cutting'
  | 'sewing'
  | 'embellishment'
  | 'ironing'
  | 'quality_check'
  | 'ready'
  | 'delivered';

export const ORDER_PIPELINE: OrderStatus[] = [
  'pending',
  'measurement',
  'cutting',
  'sewing',
  'embellishment',
  'ironing',
  'quality_check',
  'ready',
  'delivered',
];

export interface Order {
  id: number;
  customer_id: number;
  measurement_id?: number | null;
  customer?: Customer;
  title: string;
  description?: string | null;
  complexity?: 'simple' | 'standard' | 'complex';
  order_group_id?: number | null;
  measurement_snapshot?: { type: Measurement['type']; fields: Record<string, string | number>; notes?: string | null } | null;
  status: OrderStatus;
  price: number;
  deposit_paid: number;
  balance_due: number;
  due_date?: string | null;
  delivery_risk?: 'low' | 'medium' | 'high' | null;
  delivery_prediction?: DeliveryPromise | null;
  total_expenses?: number;
  gross_profit?: number;
  expenses?: OrderExpense[];
  fit_feedback?: FitFeedback | null;
  created_at: string;
}
export interface DeliveryPromise { suggested_date:string; risk:'low'|'medium'|'high'; confidence:number; workload:number; work_days:number; reason:string; }
export interface OrderExpense { id:number; category:'fabric'|'trims'|'labour'|'transport'|'outsourcing'|'other'; description:string; amount:number; expense_date:string; }
export interface FitFeedback { id:number; rating:'perfect'|'good'|'needs_adjustment'; alteration_areas?:string[]; notes?:string|null; }
export interface OrderGroup { id:number; name:string; occasion?:string|null; event_date?:string|null; notes?:string|null; orders:Order[]; }
export interface WardrobeItem { id:number; title:string; image_url?:string|null; fabric?:string|null; color?:string|null; occasion?:string|null; care_instructions?:string|null; delivered_at:string; order?:Order; }

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'paystack' | 'flutterwave';
  reference?: string | null;
  paid_at: string;
}

export interface Appointment {
  id: number;
  customer_id: number;
  customer?: Customer;
  title: string;
  type: 'consultation' | 'fitting' | 'fabric_selection' | 'delivery' | 'other';
  starts_at: string;
  ends_at: string;
  notes?: string | null;
}

// Raw shape returned by GET /dashboard/summary. Deliberately close to what
// the Laravel resources emit (nested totals, full Order/Appointment/Customer
// objects) - the mobile-friendly `DashboardSummary` below is derived from
// this in src/api/index.ts so screens don't deal with backend nesting.
export interface DashboardSummaryRaw {
  today_revenue: number;
  all_time_revenue: number;
  today_revenue_change_pct: number | null;
  outstanding_balances: { total: number; clients_pending: number };
  orders_in_production: { count: number; due_this_week: number; average_progress_pct: number };
  todays_deliveries: Order[];
  upcoming_appointments: Appointment[];
  recent_clients: Customer[];
  analytics: Array<{ label: string; value: number }>;
  rewards: RewardSummary;
}
export interface RewardSummary { onboarded_clients:number; credit_balance:number; earned_this_month:number; next_milestone:number|null; clients_to_next_milestone:number; badge:string|null; }

export interface AppNotification {
  id: string;
  type: 'order_status_updated' | 'payment_received' | string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface Conversation { customer_id: number; name: string; last_message: string | null; last_message_at: string | null; unread_count: number; }
export interface CustomerInvitation { email: string; expires_at: string; customer_name: string; designer: { id: number; name: string; business_name?: string | null; avatar_url?: string | null }; token?: string; invite_url?: string; deep_link?: string; }
export interface ChatMessage { id: number; designer_id: number; customer_id: number; sender_id: number; body: string; read_at: string | null; created_at: string; }
export interface InventoryItem { id: number; name: string; category: string; quantity: number; unit: string; reorder_level: number; }
export interface StaffMember { id: number; name: string; role: string; phone?: string | null; active: boolean; }
export interface ReportSummary { revenue: number; outstanding: number; orders_total: number; orders_delivered: number; customers: number; inventory_low: number; }

export interface DashboardSummary {
  today_revenue: number;
  all_time_revenue: number;
  today_revenue_change_pct: number | null;
  outstanding_balance: number;
  outstanding_balance_clients: number;
  orders_in_production: number;
  orders_due_this_week: number;
  production_progress_pct: number;
  today_deliveries: Array<{
    id: number;
    title: string;
    customer_name: string;
    status: OrderStatus;
    time: string;
  }>;
  appointments: Array<{
    id: number;
    title: string;
    customer_name: string;
    starts_at: string;
    ends_at: string;
  }>;
  recent_clients: Array<{ id: number; name: string }>;
  analytics: Array<{ label: string; value: number }>;
  rewards: RewardSummary;
}
