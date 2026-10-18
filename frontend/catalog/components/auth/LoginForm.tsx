import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "vike/client/router";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginUser } from "@/src/services/authService";
import { getCurrentUser } from "@/src/services/userService";
import { useAuthStore } from "@/src/store/useAuthStore";
import type { ApiError, LoginCredentials } from "@/src/types/api";

export function LoginForm() {
  const [formData, setFormData] = useState<LoginCredentials>({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginUser(formData);
      const user = await getCurrentUser();
      login(user);
      toast.success("Login successful!");
      await navigate("/my-slave");
    } catch (err) {
      setError((err as ApiError).detail || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full gap-6 p-4 shadow-lg sm:w-[360px]">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            autoComplete="username"
            required
          />
          <FormField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Login"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don’t have an account?{" "}
          <a href="/register" className="font-medium underline-offset-4 hover:underline">
            Register
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
