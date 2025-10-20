import React, { useState } from "react";

export default function FilterGroup({ title, options = [], selected = [], onToggle, singleSelect=false, showLimit=3, onClear }) {
  const [expanded, setExpanded] = useState(false);

  const normalize = (o) => typeof o === "string" ? { value: o, label: o } : o;
  const opts = options.map(normalize);
  const visible = expanded ? opts : opts.slice(0, showLimit);

  const isSelected = (val) => (selected || []).includes(val);

  const toggle = (val) => {
    if (singleSelect) {

      if (isSelected(val)) {
        onToggle([]);
      } else {
        onToggle([val]);
      }
      return;
    }

    const next = isSelected(val) ? (selected || []).filter(s => s !== val) : [...(selected||[]), val];
    onToggle(next);
  };

  return (
    <div className="filter-group mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="mb-1">{title}</h6>
        {singleSelect && (selected && selected.length > 0) && (
          <button type="button" style = {{ color: "#8a4ff0" }} onClick={() => { onToggle([]); if (onClear) onClear(); }}>Borrar</button>
        )}
      </div>

      <div className="d-flex flex-column gap-1">
        {visible.map(o => (
          <label key={o.value} className="form-check">
            <input
              className="form-check-input"
              type={singleSelect ? "radio" : "checkbox"}
              checked={isSelected(o.value)}
              onChange={() => toggle(o.value)}
            />
            <span className="form-check-label">{o.label}</span>
          </label>
        ))}

        {opts.length > showLimit &&
          <button style = {{ color: "#8a4ff0" }} onClick={() => setExpanded(!expanded)} type="button">
            {expanded ? "Ver menos" : `Ver ${opts.length - showLimit} más`}
          </button>
        }
      </div>
    </div>
  );
}
