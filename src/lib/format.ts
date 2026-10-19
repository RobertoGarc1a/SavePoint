const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
export const formatMoney = (cents: number) => currency.format(cents / 100);
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(date));
