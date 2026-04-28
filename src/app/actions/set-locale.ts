"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales, localeCookie, type Locale } from "@/i18n/config";

export async function setLocale(next: Locale) {
  if (!(locales as readonly string[]).includes(next)) return;
  const store = await cookies();
  store.set(localeCookie, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
