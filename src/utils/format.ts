export function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  measurement: 'Measurement',
  cutting: 'Cutting',
  sewing: 'Sewing',
  embellishment: 'Embellishment',
  ironing: 'Final Press',
  quality_check: 'Quality Check',
  ready: 'Ready',
  delivered: 'Delivered',
};
