import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";

export default function Page() {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const { is404 } = usePageContext();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <img src="/whisker.png" alt="" className="size-16 object-contain" />
      <h1 className="text-3xl font-bold">{is404 ? t("error.notFoundTitle") : t("error.title")}</h1>
      <p className="text-muted-foreground">{is404 ? t("error.notFound") : t("error.generic")}</p>
      <a href={localePath("/")} className="font-medium underline-offset-4 hover:underline">
        {t("error.backHome")}
      </a>
    </div>
  );
}
