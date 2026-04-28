import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, localeCookie, type Locale } from "./config";

function pickLocale(value: string | undefined | null): Locale {
  if (!value) return defaultLocale;
  const lower = value.toLowerCase();
  for (const loc of locales) {
    if (lower.startsWith(loc)) return loc;
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(localeCookie)?.value;

  let locale: Locale;
  if (fromCookie && (locales as readonly string[]).includes(fromCookie)) {
    locale = fromCookie as Locale;
  } else {
    const headerStore = await headers();
    locale = pickLocale(headerStore.get("accept-language"));
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
