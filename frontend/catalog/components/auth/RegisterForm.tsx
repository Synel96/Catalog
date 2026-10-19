import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "vike/client/router";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from "@/src/services/authService";
import type { ApiError } from "@/src/types/api";
import { formValues } from "./formValues";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";

const REDIRECT_DELAY_MS = 2000;

export function RegisterForm() {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = formValues(e.currentTarget, [
      "username",
      "email",
      "password",
      "confirmPassword",
    ]);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(formData);
      toast.success(t("auth.registerSuccess"));
      setTimeout(() => void navigate(localePath("/login")), REDIRECT_DELAY_MS);
    } catch (err) {
      setError((err as ApiError).detail || t("auth.registerFailed"));
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full gap-6 p-4 shadow-lg sm:w-[400px]">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("auth.register")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField
            label={t("auth.slavename")}
            name="username"
            placeholder={t("auth.usernamePlaceholder")}
            autoComplete="username"
            required
          />
          <FormField
            label={t("auth.email")}
            type="email"
            name="email"
            placeholder={t("auth.emailPlaceholder")}
            autoComplete="email"
            required
          />
          <FormField
            label={t("auth.password")}
            type="password"
            name="password"
            placeholder={t("auth.passwordPlaceholder")}
            autoComplete="new-password"
            required
          />
          <FormField
            label={t("auth.confirmPassword")}
            type="password"
            name="confirmPassword"
            placeholder={t("auth.confirmPasswordPlaceholder")}
            autoComplete="new-password"
            required
          />

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.registering") : t("auth.register")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          {t("auth.haveAccount")}{" "}
          <a href={localePath("/login")} className="font-medium underline-offset-4 hover:underline">
            {t("auth.login")}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
