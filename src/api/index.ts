import { apiRequest } from './client';
import { formatTime } from '../utils/format';
import type {
  Appointment,
  AppNotification,
  Customer,
  DashboardSummary,
  DashboardSummaryRaw,
  Measurement,
  Order,
  OrderStatus,
  Payment,
  Role,
  User,
  Conversation,
  ChatMessage,
  InventoryItem,
  StaffMember,
  ReportSummary,
  SubscriptionPlan,
  SubscriptionStatus,
  CustomerInvitation,
  DeliveryPromise, OrderExpense, OrderGroup, WardrobeItem, FitFeedback,
} from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),
  register: (payload: { name: string; email: string; phone: string; password: string; password_confirmation: string; role: Role }) =>
    apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  me: () => apiRequest<User>('/auth/me'),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  forgotPassword:(email:string)=>apiRequest<{message:string}>('/auth/forgot-password',{method:'POST',body:{email},auth:false}),
  resetPassword:(body:{email:string;code:string;password:string;password_confirmation:string})=>apiRequest<{message:string}>('/auth/reset-password',{method:'POST',body,auth:false}),
  resendVerification:()=>apiRequest<{message:string}>('/auth/email/resend',{method:'POST'}),
  verifyEmail:(code:string)=>apiRequest<User>('/auth/email/verify',{method:'POST',body:{code}}),
  revokeAll:()=>apiRequest<{message:string}>('/auth/sessions/revoke-all',{method:'POST'}),
  rotateToken:()=>apiRequest<{token:string;expires_at:string}>('/auth/token/rotate',{method:'POST'}),
  exportData:()=>apiRequest<Record<string,unknown>>('/account/export'),
  deleteAccount:(password:string)=>apiRequest<void>('/account',{method:'DELETE',body:{password,confirmation:'DELETE'}}),
};

export const subscriptionApi = {
  plans: () => apiRequest<SubscriptionPlan[]>('/subscription/plans', { auth: false }),
  status: () => apiRequest<SubscriptionStatus>('/subscription/status'),
  initialize: (plan: SubscriptionPlan['id'], billing_email: string) => apiRequest<{ authorization_url: string | null; access_code: string | null; reference: string; fully_credited: boolean; credit_applied: number; amount_due?: number }>('/subscription/initialize', { method: 'POST', body: { plan, billing_email } }),
  verify: (reference: string) => apiRequest(`/subscription/verify/${encodeURIComponent(reference)}`, { method: 'POST' }),
};

export const dashboardApi = {
  summary: async (range: 'week' | 'month' = 'week'): Promise<DashboardSummary> => {
    const raw = await apiRequest<DashboardSummaryRaw>(`/dashboard/summary?range=${range}`);
    return {
      today_revenue: raw.today_revenue,
      all_time_revenue: raw.all_time_revenue,
      today_revenue_change_pct: raw.today_revenue_change_pct,
      outstanding_balance: raw.outstanding_balances.total,
      outstanding_balance_clients: raw.outstanding_balances.clients_pending,
      orders_in_production: raw.orders_in_production.count,
      orders_due_this_week: raw.orders_in_production.due_this_week,
      production_progress_pct: raw.orders_in_production.average_progress_pct,
      // Orders don't carry a delivery time, only a due date - since this list
      // is already filtered to due_date == today, "Today" is accurate.
      today_deliveries: raw.todays_deliveries.map((order) => ({
        id: order.id,
        title: order.title,
        customer_name: order.customer?.name ?? 'Customer',
        status: order.status,
        time: 'Today',
      })),
      appointments: raw.upcoming_appointments.map((apt) => ({
        id: apt.id,
        title: apt.title,
        customer_name: apt.customer?.name ?? 'Client',
        starts_at: formatTime(apt.starts_at),
        ends_at: formatTime(apt.ends_at),
      })),
      recent_clients: raw.recent_clients.map((c) => ({ id: c.id, name: c.name })),
      analytics: raw.analytics,
      rewards: raw.rewards,
    };
  },
};

export const customersApi = {
  list: () => apiRequest<Customer[]>('/customers'),
  get: (id: number) => apiRequest<Customer>(`/customers/${id}`),
  create: (payload: Partial<Customer>) => apiRequest<Customer>('/customers', { method: 'POST', body: payload }),
  update: (id: number, payload: Partial<Customer>) =>
    apiRequest<Customer>(`/customers/${id}`, { method: 'PUT', body: payload }),
  measurements: (customerId: number) => apiRequest<Measurement[]>(`/customers/${customerId}/measurements`),
  addMeasurement: (customerId: number, payload: Partial<Measurement>) =>
    apiRequest<Measurement>(`/customers/${customerId}/measurements`, { method: 'POST', body: payload }),
  invite: (customerId: number, email?: string | null) => apiRequest<CustomerInvitation>(`/customers/${customerId}/invitation`, { method: 'POST', body: { email } }),
  revokeInvitation: (customerId: number) => apiRequest(`/customers/${customerId}/invitation`, { method: 'DELETE' }),
};

export const invitationsApi = {
  get: (token: string) => apiRequest<CustomerInvitation>(`/invitations/${encodeURIComponent(token)}`, { auth: false }),
  accept: (token: string, payload: { name: string; email: string; password: string; password_confirmation: string }) => apiRequest<{ user: User; token: string }>(`/invitations/${encodeURIComponent(token)}/accept`, { method: 'POST', body: payload, auth: false }),
};

export const ordersApi = {
  list: () => apiRequest<Order[]>('/orders'),
  get: (id: number) => apiRequest<Order>(`/orders/${id}`),
  create: (payload: Partial<Order>) => apiRequest<Order>('/orders', { method: 'POST', body: payload }),
  updateStatus: (id: number, status: OrderStatus) =>
    apiRequest<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  payments: (orderId: number) => apiRequest<Payment[]>(`/orders/${orderId}/payments`),
  addPayment: (orderId: number, payload: Partial<Payment>) =>
    apiRequest<Payment>(`/orders/${orderId}/payments`, { method: 'POST', body: payload }),
  deliveryPromise: (complexity: 'simple'|'standard'|'complex', garment_count=1) => apiRequest<DeliveryPromise>('/delivery-promises',{method:'POST',body:{complexity,garment_count}}),
  addExpense: (orderId:number,payload:Partial<OrderExpense>) => apiRequest<OrderExpense>(`/orders/${orderId}/expenses`,{method:'POST',body:payload}),
  deleteExpense: (orderId:number,expenseId:number) => apiRequest<void>(`/orders/${orderId}/expenses/${expenseId}`,{method:'DELETE'}),
  fitFeedback: (orderId:number,payload:Partial<FitFeedback>) => apiRequest<FitFeedback>(`/orders/${orderId}/fit-feedback`,{method:'POST',body:payload}),
};
export const groupsApi = {
  list:()=>apiRequest<OrderGroup[]>('/order-groups'),
  create:(payload:{name:string;occasion?:string;event_date?:string;members:Array<Partial<Order>>})=>apiRequest<OrderGroup>('/order-groups',{method:'POST',body:payload}),
};
export const wardrobeApi = {
  list:()=>apiRequest<WardrobeItem[]>('/wardrobe'),
  update:(id:number,payload:Partial<WardrobeItem>)=>apiRequest<WardrobeItem>(`/wardrobe/${id}`,{method:'PATCH',body:payload}),
};

export const appointmentsApi = {
  list: () => apiRequest<Appointment[]>('/appointments'),
  create: (payload: Partial<Appointment>) =>
    apiRequest<Appointment>('/appointments', { method: 'POST', body: payload }),
};

export const notificationsApi = {
  list: () => apiRequest<{ notifications: AppNotification[]; unread_count: number }>('/notifications'),
  markRead: (id: string) => apiRequest<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest<void>('/notifications/read-all', { method: 'POST' }),
};

export const messagesApi = {
  conversations: () => apiRequest<Conversation[]>('/conversations'),
  thread: (customerId?: number) => apiRequest<ChatMessage[]>(`/messages${customerId ? `/${customerId}` : ''}`),
  send: (body: string, customerId?: number) => apiRequest<ChatMessage>(`/messages${customerId ? `/${customerId}` : ''}`, { method: 'POST', body: { body } }),
};

export const reportsApi = { summary: () => apiRequest<ReportSummary>('/reports/summary') };
export const inventoryApi = {
  list: () => apiRequest<InventoryItem[]>('/inventory'),
  create: (body: Partial<InventoryItem>) => apiRequest<InventoryItem>('/inventory', { method: 'POST', body }),
};
export const staffApi = {
  list: () => apiRequest<StaffMember[]>('/staff'),
  create: (body: Partial<StaffMember>) => apiRequest<StaffMember>('/staff', { method: 'POST', body }),
};
export const settingsApi = {
  update: (body: Partial<User> & { current_password?: string; password?: string; password_confirmation?: string }) =>
    apiRequest<User>('/settings', { method: 'PATCH', body }),
};
