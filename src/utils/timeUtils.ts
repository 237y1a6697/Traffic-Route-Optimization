/**
 * Accurate Real-Time Clock & Trip Timing Utilities
 * Keeps route departure and estimated arrival times synchronized with genuine current local time.
 */

export function getCurrentClockTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

export function parseDepartureTimeToDate(departureTimeStr?: string): Date {
  const now = new Date();
  if (!departureTimeStr || departureTimeStr.toLowerCase().includes('now')) {
    return now;
  }

  const match = departureTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) {
    return now;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = (match[3] || '').toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  return targetDate;
}

export function computeArrivalClockTime(departureTimeStr?: string, durationMins: number = 0): string {
  const depDate = parseDepartureTimeToDate(departureTimeStr);
  const arrDate = new Date(depDate.getTime() + Math.max(0, Math.round(durationMins)) * 60 * 1000);
  return arrDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}
