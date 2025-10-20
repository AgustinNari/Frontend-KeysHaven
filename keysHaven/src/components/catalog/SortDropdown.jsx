import React from "react";

const options = [
  { value: "amountSold_desc", label: "Más vendidos" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "createdAt_asc", label: "Más antiguos" },
  { value: "createdAt_desc", label: "Más nuevos" },
  { value: "metacritic_asc", label: "Metacritic: menor a mayor" },
  { value: "metacritic_desc", label: "Metacritic: mayor a menor" },
  { value: "avgRating_desc", label: "Mejor valorados" },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <select className="form-select catalog-sort" value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
