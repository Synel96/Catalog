import { useEffect } from "react";
import { navigate } from "vike/client/router";
import { useAuthStore } from "@/src/store/useAuthStore";
import { SlaveProfileCard } from "./SlaveProfileCard";
import { SlaveProfileSkeleton } from "./SlaveProfileSkeleton";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";

export function MySlaveSection() {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const user = useAuthStore((state) => state.user);
  const refetchUser = useAuthStore((state) => state.refetchUser);

  // Always revalidate against the backend: the persisted user may be stale,
  // and the cookie session may have expired since it was stored.
  useEffect(() => {
    void refetchUser().then((fresh) => {
      if (!fresh) void navigate(localePath("/login"));
    });
  }, [refetchUser, localePath]);

  if (!user) return <SlaveProfileSkeleton />;

  return (
    <div>
      <h1 className="mb-2 text-center text-3xl font-bold md:text-4xl">{t("profile.slave")}</h1>
      <SlaveProfileCard user={user} />
    </div>
  );
}
