import { useTranslation } from "react-i18next";
import { API_MOCKS } from "@/components/site";
import { Card, CardContent } from "@/components/ui/card";
import { DATE_LOCALES } from "@/src/i18n/config";
import { useLang } from "@/src/i18n/hooks";

type MewsItem = {
  // Translation key prefix under "mews.items" in src/locales/*.json.
  key: string;
  date: string;
  paragraphs: number;
};

// The mock-test announcement is only true of mock builds (see
// src/mocks), so a build against the real backend leaves it out.
const MEWS: MewsItem[] = API_MOCKS ? [{ key: "testing", date: "2026-10-18", paragraphs: 4 }] : [];

export default function Page() {
  const { t } = useTranslation();
  const lang = useLang();
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(DATE_LOCALES[lang], {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">{t("mews.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("mews.tagline")}</p>

      {MEWS.length === 0 ? (
        <p className="text-muted-foreground">{t("mews.empty")}</p>
      ) : (
        <div className="grid gap-6">
          {MEWS.map(({ key, date, paragraphs }) => {
            const k = (field: string) => t(`mews.items.${key}.${field}`);
            return (
              <Card key={key} className="p-2 shadow-md">
                <CardContent>
                  <article className="grid gap-4">
                    <header className="grid gap-2">
                      <time dateTime={date} className="text-muted-foreground text-sm">
                        {formatDate(date)}
                      </time>
                      <h2 className="text-2xl leading-tight font-bold">{k("title")}</h2>
                      <p className="text-lg font-medium">{k("lede")}</p>
                    </header>
                    {Array.from({ length: paragraphs }, (_, i) => (
                      <p key={i}>{k(`p${i + 1}`)}</p>
                    ))}
                    <blockquote className="border-primary border-l-4 pl-4 italic">
                      <p>“{k("quote")}”</p>
                      <footer className="text-muted-foreground mt-1 text-sm not-italic">
                        — {k("quoteBy")}
                      </footer>
                    </blockquote>
                  </article>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
