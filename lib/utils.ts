import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function calculatePace(distanceMeters: number, timeSeconds: number): number {
  // Retorna pace em segundos por km
  if (distanceMeters === 0) return 0
  return (timeSeconds / distanceMeters) * 1000
}

export function calculateAccuracy(correct: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((correct / total) * 100)}%`;
}

// Format pace (min/km) from distance and time
export function formatPace(distanceMeters: number, timeSeconds: number): string {
  if (distanceMeters === 0) return '-';
  const distanceKm = distanceMeters / 1000;
  const paceSeconds = timeSeconds / distanceKm;
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.floor(paceSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/km`;
}
