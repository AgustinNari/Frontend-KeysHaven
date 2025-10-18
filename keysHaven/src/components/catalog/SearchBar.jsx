import React from "react";

export default function SearchBar({ value, onChange, onSearch }) {
  return (
    <div className="search-bar w-100 d-flex align-items-center">
      <input
        className="form-control"
        type="search"
        placeholder="Buscar juegos..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && onSearch) onSearch(); }}
      />
    </div>
  );
}
