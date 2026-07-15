const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

const ARABIC_PERCENT = "\u066A";

export function toArabicNumeral(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_DIGITS[parseInt(d, 10)] ?? d)
    .join("");
}

export function formatArabicPercent(n: number): string {
  return `${toArabicNumeral(Math.round(n))}${ARABIC_PERCENT}`;
}

export function formatArabicPlusPercent(n: number): string {
  return `+${toArabicNumeral(Math.round(n))}${ARABIC_PERCENT}`;
}

export function formatArabicPlusPoints(n: number): string {
  return `+${toArabicNumeral(n)} نقطة`;
}
