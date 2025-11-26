import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
