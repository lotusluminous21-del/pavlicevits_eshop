import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, localeCookie, type Locale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(localeCookie)?.value;

  const locale: Locale =
    fromCookie && (locales as readonly string[]).includes(fromCookie)
      ? (fromCookie as Locale)
      : defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
