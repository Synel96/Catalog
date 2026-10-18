import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "vike/client/router";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from "@/src/services/authService";
import type { ApiError, RegisterPayload } from "@/src/types/api";

const REDIRECT_DELAY_MS = 2000;

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterPayload>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(formData);
      toast.success("Registration successful! Please check your email to activate your account.");
      setTimeout(() => void navigate("/login"), REDIRECT_DELAY_MS);
    } catch (err) {
      setError((err as ApiError).detail || "Registration failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full gap-6 p-4 shadow-lg sm:w-[400px]">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Register</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField
            label="Slavename"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            autoComplete="username"
            required
          />
          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
          <FormField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="new-password"
            required
          />
          <FormField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registering…" : "Register"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="font-medium underline-offset-4 hover:underline">
            Login
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
