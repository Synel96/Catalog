import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { WelcomeTutorial } from "@/components/tutorial/tutorials";

export default function Page() {
  return (
    <AuthSplitLayout>
      <RegisterForm />
      <WelcomeTutorial />
    </AuthSplitLayout>
  );
}
