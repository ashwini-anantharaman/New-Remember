import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout.jsx";
import LoginForm from "@/components/auth/LoginForm.jsx";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to manage your memorials"
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-r-text underline-offset-4 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
