import { hasLocale } from "next-intl";
import { getRequestConfig, RequestConfig } from "next-intl/server";

export default getRequestConfig(async ({requestLocale}:any) => {
  const requested = await requestLocale;
  const locale = hasLocale(["en", "zh-TW", "ja"], requested)
    ? requested
    : "en";
 
  return {
    locale,
    messages: (await import(`../app/messages/${locale}.json`)).default,
  };
});
