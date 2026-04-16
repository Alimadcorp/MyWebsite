"use client";

import { useEffect, useState } from "react";

function TimeAgo({ dateStr }) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff / (1000 * 60));

  let label;
  if (days > 365) label = `${Math.floor(days / 365)}y ago`;
  else if (days > 30) label = `${Math.floor(days / 30)}mo ago`;
  else if (days > 0) label = `${days}d ago`;
  else if (hours > 0) label = `${hours}h ago`;
  else label = `${mins}m ago`;

  return (
    <time
      dateTime={date.toISOString()}
      title={date.toLocaleString()}
      style={{ opacity: 0.45, fontSize: "0.78rem", letterSpacing: "0.03em" }}
    >
      {label}
    </time>
  );
}

export default function Ripple() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Could not reach status endpoint."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #ffffff;
          --fg: #111111;
          --muted: #777777;
          --border: rgba(0,0,0,0.09);
          --card: rgba(0,0,0,0.025);
          --accent-green: #16a34a;
          --accent-red: #dc2626;
          --accent-amber: #d97706;
          --radius: 10px;
          --font: 'Georgia', 'Times New Roman', serif;
          --mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Courier New', monospace;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #0a0a0a;
            --fg: #e8e8e8;
            --muted: #666666;
            --border: rgba(255,255,255,0.07);
            --card: rgba(255,255,255,0.03);
            --accent-green: #22c55e;
            --accent-red: #f87171;
            --accent-amber: #fbbf24;
          }
        }

        body {
          background: var(--bg);
          color: var(--fg);
          font-family: var(--font);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          -webkit-font-smoothing: antialiased;
        }

        .shell {
          width: 100%;
          max-width: 540px;
        }

        .header {
          margin-bottom: 2.5rem;
        }
        .header-eyebrow {
          font-family: var(--mono);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.55rem;
        }
        .header-name {
          font-size: 1.55rem;
          font-weight: 400;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 0.35rem 0.85rem 0.35rem 0.6rem;
          font-family: var(--mono);
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          margin-top: 1.6rem;
          background: var(--card);
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-green { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green); }
        .dot-red   { background: var(--accent-red);   box-shadow: 0 0 6px var(--accent-red); }

        .divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2rem 0;
        }

        .section-label {
          font-family: var(--mono);
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 1rem;
        }

        .card {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.1rem 1.25rem;
          background: var(--card);
          margin-bottom: 0.65rem;
        }
        .card:last-child { margin-bottom: 0; }

        .note-text {
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--fg);
        }
        .note-footer {
          margin-top: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alert-card {
          border-color: color-mix(in srgb, var(--accent-amber) 35%, transparent);
        }
        .alert-icon {
          font-size: 0.8rem;
          color: var(--accent-amber);
          font-family: var(--mono);
          letter-spacing: 0.04em;
          margin-bottom: 0.4rem;
        }
        .alert-link {
          display: inline-block;
          margin-top: 0.55rem;
          font-family: var(--mono);
          font-size: 0.72rem;
          color: var(--muted);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .ip-row {
          font-family: var(--mono);
          font-size: 0.78rem;
          color: var(--muted);
          letter-spacing: 0.03em;
        }

        .loading-line {
          font-family: var(--mono);
          font-size: 0.8rem;
          color: var(--muted);
          letter-spacing: 0.06em;
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }

        .present-msg {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.6;
          margin-top: 1rem;
        }

        .footer {
          margin-top: 3rem;
          font-family: var(--mono);
          font-size: 0.65rem;
          color: var(--muted);
          letter-spacing: 0.06em;
          opacity: 0.5;
        }
      `}</style>

      <main className="shell">
        <div className="header">
          <p className="header-eyebrow">status page</p>
          <h1 className="header-name">Ali Madani</h1>

          {loading && (
            <div className="status-badge" style={{ marginTop: "1.6rem" }}>
              <div className="dot" style={{ background: "var(--muted)" }} />
              <span className="loading-line">checking in…</span>
            </div>
          )}

          {!loading && !error && data?.present && (
            <div className="status-badge">
              <div className="dot dot-green" />
              <span>active · checked in recently</span>
            </div>
          )}

          {!loading && !error && data && !data.present && (
            <div className="status-badge">
              <div className="dot dot-red" />
              <span>no recent check-in</span>
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: "var(--accent-red)", fontFamily: "var(--mono)", fontSize: "0.8rem" }}>
            {error}
          </p>
        )}

        {data?.present && (
          <p className="present-msg">
            Everything looks fine. This page updates automatically.
          </p>
        )}

        {data && !data.present && (
          <>
            {data.ip && (
              <>
                <hr className="divider" />
                <p className="section-label">last known</p>
                <p className="ip-row">ip · {data.ip}</p>
              </>
            )}

            {data.notes?.length > 0 && (
              <>
                <hr className="divider" />
                <p className="section-label">notes left behind</p>
                {data.notes.map((note, i) => (
                  <div className="card" key={i}>
                    <p className="note-text">{note.text}</p>
                    <div className="note-footer">
                      <TimeAgo dateStr={note.time} />
                    </div>
                  </div>
                ))}
              </>
            )}

            {data.alerts?.length > 0 && (
              <>
                <hr className="divider" />
                <p className="section-label">alerts</p>
                {data.alerts.map((alert, i) => (
                  <div className="card alert-card" key={i}>
                    <p className="alert-icon">⚠ alert</p>
                    <p className="note-text">{alert.text}</p>
                    {alert.url && (
                      <a
                        className="alert-link"
                        href={alert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {alert.url}
                      </a>
                    )}
                  </div>
                ))}
              </>
            )}

            {!data.notes?.length && !data.alerts?.length && (
              <p className="present-msg" style={{ marginTop: "1.5rem" }}>
                No notes or alerts are visible for your location yet.
              </p>
            )}
          </>
        )}

        <p className="footer">auto · {new Date().getFullYear()}</p>
      </main>
    </>
  );
}