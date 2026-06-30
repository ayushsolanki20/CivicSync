import { type ClassValue, clsx } from "clsx";
import { NyClassName } from "class-variance-authority"; // Wait, is there NyClassName or normal clsx?
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
