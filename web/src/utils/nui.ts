const isInGame = !!(window as unknown as Record<string, unknown>).invokeNative;

export async function fetchNui<T = unknown>(eventName: string, data?: Record<string, unknown>): Promise<T> {
  if (!isInGame) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({} as T), 200);
    });
  }

  const w = window as unknown as Record<string, unknown>;
  const resourceName = w.GetParentResourceName
    ? (w.GetParentResourceName as () => string)()
    : 'imrp_opiumnights';

  const resp = await fetch(`https://${resourceName}/${eventName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });

  return resp.json() as Promise<T>;
}

export function closeNui(): void {
  fetchNui('close');
}

export function formatMoney(amount: number): string {
  return '$' + amount.toLocaleString();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysRemaining(expireDate: string): number {
  if (!expireDate) return 0;
  const now = new Date().getTime();
  const expiry = new Date(expireDate).getTime();
  const diff = expiry - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getRoomTypeColor(type: string): string {
  switch (type) {
    case 'standard': return 'text-gray-400';
    case 'deluxe': return 'text-blue-400';
    case 'executive': return 'text-purple-400';
    case 'luxury': return 'text-hotel-gold';
    case 'penthouse': return 'text-amber-300';
    default: return 'text-gray-400';
  }
}

export function getRoomTypeBg(type: string): string {
  switch (type) {
    case 'standard': return 'from-gray-600/20 to-gray-800/20';
    case 'deluxe': return 'from-blue-600/20 to-blue-800/20';
    case 'executive': return 'from-purple-600/20 to-purple-800/20';
    case 'luxury': return 'from-amber-600/20 to-amber-800/20';
    case 'penthouse': return 'from-yellow-500/20 to-amber-700/20';
    default: return 'from-gray-600/20 to-gray-800/20';
  }
}
