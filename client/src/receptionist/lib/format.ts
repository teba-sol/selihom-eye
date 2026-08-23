export function todayEatDate(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function formatTime(time: string): string {
  return time;
}

export function formatDate(date: string): string {
  return date;
}
