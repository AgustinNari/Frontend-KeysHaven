import React from "react";


export default function Rating({ value = 0, count = 0, size = 14 }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const idx = i + 1;
    if (value >= idx) return "full";
    if (value >= idx - 0.5) return "half";
    return "empty";
  });

  const StarFull = ({ keyId }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" key={keyId} aria-hidden>
      <path fill="currentColor" d="M12 .587l3.668 7.431L23.5 9.75l-5.667 5.525L19.335 24 12 19.897 4.665 24l1.502-8.725L.5 9.75l7.832-1.732z" />
    </svg>
  );

  const StarHalf = ({ keyId }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" key={keyId} aria-hidden>
      <defs>
        <linearGradient id={`halfGrad${keyId}`}>
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path fill={`url(#halfGrad${keyId})`} d="M12 .587l3.668 7.431L23.5 9.75l-5.667 5.525L19.335 24 12 19.897 4.665 24l1.502-8.725L.5 9.75l7.832-1.732z" />
      <path fill="none" stroke="currentColor" strokeWidth="0.7" d="M12 .587l3.668 7.431L23.5 9.75l-5.667 5.525L19.335 24 12 19.897 4.665 24l1.502-8.725L.5 9.75l7.832-1.732z" />
    </svg>
  );

  const StarEmpty = ({ keyId }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" key={keyId} aria-hidden>
      <path fill="transparent" stroke="currentColor" strokeWidth="0.9" d="M12 .587l3.668 7.431L23.5 9.75l-5.667 5.525L19.335 24 12 19.897 4.665 24l1.502-8.725L.5 9.75l7.832-1.732z" />
    </svg>
  );

  return (
    <div className="rating" style={{ color: "#ffd166" }}>
      <div style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
        {stars.map((s, idx) => {
          const keyId = `s${idx}-${s}`;
          if (s === "full") return <StarFull key={keyId} keyId={keyId} />;
          if (s === "half") return <StarHalf key={keyId} keyId={keyId} />;
          return <StarEmpty key={keyId} keyId={keyId} />;
        })}
      </div>
      {typeof count === "number" && (
        <div className="count" style={{ marginLeft: 6 }}>{count ? `(${count})` : ""}</div>
      )}
    </div>
  );
}
