import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <SignIn afterSignInUrl="/auth/complete?event=signin" />
    </div>
  );
}

export function generateStaticParams() {
  return [
    { 'sign-in': [] },
  ];
}
