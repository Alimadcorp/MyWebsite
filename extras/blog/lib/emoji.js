import React, { useState, useEffect } from "react";

export function Emoji({ name }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setUrl(`https://emoji.alimad.co/${name}`);
  }, [name]);

  if (error || !url) {
    return <span style={{ color: "#eab308" }}>:{name}:</span>;
  }

  return (
    <span
      style={{
        display: "inline-block",
        verticalAlign: "text-bottom",
        transform: "translateY(3px)",
        margin: "0 2px",
      }}
    >
      <img
        src={url}
        alt={name}
        onError={() => setError(true)}
        style={{
          width: "1.25rem",
          height: "1.25rem",
          display: "inline",
        }}
      />
    </span>
  );
}
