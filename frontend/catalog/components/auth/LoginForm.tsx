import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "vike/client/router";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginUser } from "@/src/services/authService";
import { getCurrentUser } from "@/src/services/userService";
import { useAuthStore } from "@/src/store/useAuthStore";
import type { ApiError } from "@/src/types/api";
import { formValues } from "./formValues";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";
import { useMounted } from "@/src/hooks/use-mounted";

export function LoginForm() {
  const mounted = useMounted();
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const credentials = formValues(e.currentTarget, ["username", "password"]);
    setError("");
    setIsSubmitting(true);

    try {
      await loginUser(credentials);
      const user = await getCurrentUser();
      login(user);
      toast.success(t("auth.loginSuccess"));
      await navigate(localePath("/my-slave"));
    } catch (err) {
      setError((err as ApiError).detail || t("auth.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full gap-6 p-4 shadow-lg sm:w-[360px]">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("auth.login")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* method="post": should the form ever submit natively (before
            hydration), the credentials must not end up in the URL. */}
        <form method="post" onSubmit={handleSubmit} className="grid gap-4">
          <FormField
            label={t("auth.username")}
            name="username"
            placeholder={t("auth.usernamePlaceholder")}
            autoComplete="username"
            required
          />
          <FormField
            label={t("auth.password")}
            type="password"
            name="password"
            placeholder={t("auth.passwordPlaceholder")}
            autoComplete="current-password"
            required
          />

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}

          {/* Disabled until hydrated, which also blocks submitting with Enter;
              what was typed meanwhile is kept (see formValues). */}
          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            disabled={!mounted || isSubmitting}
          >
            {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          {t("auth.noAccount")}{" "}
          <a
            href={localePath("/register")}
            className="font-medium underline-offset-4 hover:underline"
          >
            {t("auth.register")}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
