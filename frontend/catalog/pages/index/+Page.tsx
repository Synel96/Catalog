import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { WelcomeTutorial } from "@/components/tutorial/tutorials";

export default function Page() {
  return (
    <AuthSplitLayout>
      <LoginForm />
      <WelcomeTutorial />
    </AuthSplitLayout>
  );
}
