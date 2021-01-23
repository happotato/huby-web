import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import * as HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { abbrvNumber } from "./utils";

i18n
  .use(LanguageDetector)
  .use(HttpApi as any)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        switch (format) {
          case "abbr": {
            return abbrvNumber(value as number);
          };

          case "datetime": {
            const rtf = new (Intl as any).RelativeTimeFormat(lng, {
              numeric: "auto",
            });

            const now = new Date();
            const elapsed = now.getTime() - value.getTime();

            const msPerMinute = 60 * 1000;
            const msPerHour = msPerMinute * 60;
            const msPerDay = msPerHour * 24;
            const msPerWeek = msPerDay * 7;
            const msPerMonth = msPerWeek * 4;
            const msPerQuarter = msPerMonth * 3;
            const msPerYear = msPerQuarter * 4;

            if (elapsed < msPerMinute) {
              return rtf.format(-Math.round(elapsed / 1000), "second");
            } else if (elapsed < msPerHour) {
              return rtf.format(-Math.round(elapsed / msPerMinute), "minute");
            } else if (elapsed < msPerDay) {
              return rtf.format(-Math.round(elapsed / msPerHour), "hour");
            } else if (elapsed < msPerWeek) {
              return rtf.format(-Math.round(elapsed / msPerDay), "day");
            } else if (elapsed < msPerMonth) {
              return rtf.format(-Math.round(elapsed / msPerWeek), "week");
            } else if (elapsed < msPerQuarter) {
              return rtf.format(-Math.round(elapsed / msPerMonth), "month");
            } else if (elapsed < msPerYear) {
              return rtf.format(-Math.round(elapsed / msPerQuarter), "quarter");
            } else {
              return rtf.format(-Math.round(elapsed / msPerYear), "year");
            }
          };
        }

        return value;
      },
    },
    backend: {
      loadPath: "/assets/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
