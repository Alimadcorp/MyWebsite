import { CheckCheck } from 'lucide-react';

export default function Done() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-green-100 to-teal-100 p-6 text-black font-sans">
      <h1 className="text-3xl font-bold text-center mb-4"><CheckCheck className="inline-block mr-0" /> You&apos;re all done!</h1>
      <p className="text-lg text-center">Thanks for confirming your mail. You may now leave this site.</p>
    </div>
  );
}
