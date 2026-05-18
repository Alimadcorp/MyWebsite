'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';


function isValid(value: string): boolean {
  const num: boolean = /^[0-9]+$/.test(value);
  return num;
}

export default function ReadForm() {
  const { id } = useParams();
  const router = useRouter();
  const [reg, setReg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    const payload = {
      id
    };

    try {
      setLoading(true);
      await fetch('/api/log', {
        method: 'POST',
        body: JSON.stringify({ payload, status }),
      });
      router.push('/done');
    } catch (e) {
      console.error('Submission failed:', e);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isValid(id as string)) {
      alert('Invalid mail ID. Please recheck the ID at the back of the mail.');
    }
  }, [id]);


  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 to-yellow-100 dark:from-gray-900 dark:to-black p-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="w-full max-w-md bg-transparent">
        <h1 className="text-2xl font-bold text-center mb-6">Update Mail Status</h1>

        {error && (
          <div className="text-red-500 text-sm text-center -mt-2 mb-3">{error}</div>
        )}

        <div className="space-y-3">
          <div className='flex flex-row items-center gap-3'>
            <input
              type="checkbox"
              name="reg"
              id="reg"
              checked={reg}
              onChange={(e) => setReg(e.target.checked)}
              className="w-4 h-4"
            />
            <p>I confirm that the mail has been recieved and is visually intact.</p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !reg}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </div>
            ) : (
              'Update'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
