type LogEntry = {
  ip: string;
  text: string;
  status: 'Read' | 'Tampered';
  time: string;
};

type ParsedLog = {
  ip: string;
  id: string;
  name?: string;
  pamphlets?: number;
  rating?: number;
  response?: string;
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function AdminPage({ searchParams }: Props) {
  searchParams = await searchParams;
  const password = searchParams.password;
  if (password !== 'PASSWORDISBANANA') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans">
        <p className="text-lg">Invalid password.</p>
      </div>
    );
  }

  const res = await fetch(`https://log.alimad.co/api/pull?channel=mail-alimad-co-read-2&pwd=PASSWORDISBANANA`, {
    cache: 'no-store',
  });
  const data = await res.json();

  const logs: LogEntry[] = data.logs || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">Mail Read Logs</h1>

      {logs.length === 0 ? (
        <p className="text-center text-gray-500">No logs found.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {logs.map((log, idx) => {
            let parsed: ParsedLog = { id: '', ip: '' };
            try {
              parsed = JSON.parse(decodeURIComponent(log.text));
              parsed.ip = log.ip;
            } catch {
              return null;
            }

            const isMissing =
              !parsed.name || parsed.pamphlets == null || parsed.rating == null;

            return (
              <div
                key={idx}
                className={`border rounded p-4 shadow transition-colors ${
                  log.status === 'Tampered' || isMissing
                    ? 'border-red-500 bg-linear-to-br from-red-950 to-black'
                    : 'border-green-400 bg-linear-to-br from-green-900 to-black'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">
                    {parsed.name || <span className="text-red-500">Missing Name</span>}
                  </h2>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      log.status === 'Tampered'
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <strong>Mail ID:</strong>{' '}
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded font-mono">
                      {parsed.id}
                    </code>
                  </p>
                  <p>
                    <strong>Pamphlets:</strong>{' '}
                    {parsed.pamphlets != null ? parsed.pamphlets : <span className="text-red-500">Missing</span>}
                  </p>
                  <p>
                    <strong>Rating:</strong>{' '}
                    {parsed.rating != null ? `${parsed.rating}/5` : <span className="text-red-500">Missing</span>}
                  </p>
                  <p>
                    <strong>IP:</strong>{' '}
                    {parsed.ip || <span className="text-red-500">Missing</span>}
                  </p>
                  <p>
                    <strong>Response:</strong>{' '}
                    {parsed.response ? (
                      <p className="wrap-break-word">{parsed.response}</p>
                    ) : (
                      <span className="text-red-500">Missing</span>
                    )}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    <strong>Time:</strong> {new Date(log.time).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
