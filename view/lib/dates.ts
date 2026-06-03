export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function isTodayOrFuture(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${dateStr}T00:00:00`);
  return selected >= today;
}
