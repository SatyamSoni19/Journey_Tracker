import { AuthLeftPanel } from "@/components/features/auth/AuthLeftPanel";
import { AuthForm } from "@/components/features/auth/AuthForm";

export default function Auth() {
  return (
    <div className="flex min-h-screen">
      {/* Left — Illustration panel (hidden on mobile) */}
      <AuthLeftPanel />

      {/* Right — Form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <AuthForm />
      </div>
    </div>
  );
}
