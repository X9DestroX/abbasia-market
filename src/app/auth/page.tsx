
import { Suspense } from "react";
import AuthForm from "@/components/auth/auth-form";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F7F5EF] p-10 text-[#173650]">
          Loading ABBASIA...
        </main>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
