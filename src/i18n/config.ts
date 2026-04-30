export const locales = ["en", "el"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "el";
export const localeCookie = "pv-locale";
