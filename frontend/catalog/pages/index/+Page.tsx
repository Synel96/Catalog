import { useEffect } from "react";
import { navigate } from "vike/client/router";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { InstallAppCard } from "@/components/InstallAppCard";
import { WelcomeTutorial } from "@/components/tutorial/tutorials";
import { useLocalePath } from "@/src/i18n/hooks";
import { isStandalone } from "@/src/pwa";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function Page() {
  const localePath = useLocalePath();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // The installed app starts here (manifest start_url): someone already
  // logged in goes straight on to their profile instead of the login form.
  useEffect(() => {
    if (isAuthenticated && isStandalone()) void navigate(localePath("/my-slave"));
  }, [isAuthenticated, localePath]);

  return (
    <AuthSplitLayout>
      <div className="flex w-full flex-col items-center gap-6 sm:w-[360px]">
        <LoginForm />
        <InstallAppCard className="w-full" />
      </div>
      <WelcomeTutorial />
    </AuthSplitLayout>
  );
}
