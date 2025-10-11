import React from 'react';

export default function TopCategories({ categories }) {
    return (
        <div>
        <h5>Categorías</h5>
        <div className="d-flex gap-2 flex-wrap">
            {categories.map(c => (
            <button key={c.id} className="btn btn-outline-secondary btn-sm">{c.name}</button>
            ))}
        </div>
        </div>
    );
}
