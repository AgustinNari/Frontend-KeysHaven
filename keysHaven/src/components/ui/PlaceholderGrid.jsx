import React from 'react';

export default function PlaceholderGrid({ count = 6 }) {
    const items = Array.from({ length: count });
    return (
        <div className="row g-3">
        {items.map((_, i) => (
            <div key={i} className="col" style={{ minWidth: '18%' }}>
            <div className="card h-100 p-3">
                <div className="placeholder bg-secondary mb-3" style={{ height: '120px', width: '100%', opacity: 0.15 }} />
                <div className="placeholder-glow">
                <p className="placeholder col-6"></p>
                </div>
                <p className="small text-muted">Descripción corta (placeholder)</p>
            </div>
            </div>
        ))}
        </div>
    );
}
