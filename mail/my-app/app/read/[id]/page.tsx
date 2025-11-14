'use client';
import { useParams, useRouter } from 'next/navigation';
import { SetStateAction, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';


function isValid(value: string): boolean {
  const hex: boolean = /^[0-9a-fA-F]+$/.test(value);
  const len: boolean = value.length % 8 == 0;
  return hex && len;
}

export default function ReadForm() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [pamphlets, setPamphlets] = useState('');
  const [response, setResponse] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    const pCount = parseInt(pamphlets, 10);
    if (!name || !pCount) {
      setError('Please fill in all fields.');
      return;
    }

    const status = (id as string).length / 8 !== pCount ? 'Tampered' : 'Read';

    const payload = {
      id,
      name,
      pamphlets: pCount,
      rating: rating || 0,
      response: response || 'No response provided',
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
        <h1 className="text-2xl font-bold text-center mb-6">Enter Details</h1>

        {error && (
          <div className="text-red-500 text-sm text-center -mt-2 mb-3">{error}</div>
        )}

        <div className="space-y-3">
          <Input
            placeholder="Your Full Name"
            value={name}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setName(e.target.value)}
          />

          <Input
            placeholder="Number of Pamphlets"
            type="number"
            value={pamphlets}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPamphlets(e.target.value)}
          />

          <div className='text-center'>
            <p className="mb-1">Rate your experience:</p>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    rating >= n ? 'text-yellow-400' : 'text-gray-400 dark:text-gray-600'
                  }`}
                  onClick={() => setRating(n)}
                  fill={rating >= n ? 'currentColor' : 'none'}
                />
              ))}
            </div>
          </div>

          <div>
            <textarea
              placeholder="How can we improve?"
              className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={response}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setResponse(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-70"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </div>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
