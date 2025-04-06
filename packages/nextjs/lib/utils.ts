// Create a simplified version of the cn utility function
// that doesn't rely on clsx or twMerge which might be causing the issue

export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ")
}

