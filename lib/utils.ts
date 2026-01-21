import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTaka(amount: number): string {
  return new Intl.NumberFormat("bn-BD").format(amount);
}
