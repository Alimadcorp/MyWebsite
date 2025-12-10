'use client';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SetStateAction, useState } from 'react';
import { Mail } from 'lucide-react';

function isValid(value: string): boolean {
  const hex: boolean = /^[0-9a-fA-F]+$/.test(value);
  const len: boolean = value.length % 8 == 0;
  return hex && len;
}

export default function Read() {
  const router = useRouter();
  const [id, setId] = useState('');

  const submit = () => {
    if (id.trim() && isValid(id.trim())) router.push(`/read/${id.trim()}`);
    else alert('Invalid Mail ID.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-100 to-purple-200 text-gray-900 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4"><Mail className="inline-block mr-0" /> Confirm Mail Receipt</h1>
      <Input
        placeholder="Enter your Mail ID"
        value={id}
        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setId(e.target.value)}
        onKeyDown={(e: { key: string; }) => { if (e.key === 'Enter') submit(); }}
        className="max-w-sm"
      />
      <Button onClick={submit} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
        Continue
      </Button>
    </div>
  );
}
