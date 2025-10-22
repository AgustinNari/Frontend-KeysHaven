import React from "react";
import FilterGroup from "./FilterGroup";

const PLATFORMS = ["PC","Steam","Epic Games","PlayStation","Xbox","Nintendo Switch"];
const REGIONS = ["GLOBAL","NA","EU","ASIA","LATAM"];
const DEVELOPERS = ["Rockstar North","SmallDev","Ubisoft","EA","CD Projekt","Bethesda"];
const PUBLISHERS = ["Rockstar Games","IndiePub","Ubisoft","EA","CD Projekt","Bethesda"];

export default function SidebarFilters({ categories = [], workingFilters, setWorkingFilters, onApply, onClearAll }) {
  workingFilters = workingFilters || {};

  const setField = (key, value) => {
    setWorkingFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearField = (key) => {
    setWorkingFilters(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleApplyClick = () => {
    onApply({ ...workingFilters });
  };

  return (
    <div className="filters-panel p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Filtros</h5>
        <button style={{ color: "#8a4ff0" }} onClick={onClearAll}>Limpiar todo</button>
      </div>

      <div className="mb-3">
        <label className="form-label">Precio</label>
        <div className="d-flex gap-2">
          <input type="number" className="form-control" placeholder="Min" value={workingFilters.minPrice ?? ""} onChange={e => setField("minPrice", e.target.value ? Number(e.target.value) : null)} />
          <input type="number" className="form-control" placeholder="Max" value={workingFilters.maxPrice ?? ""} onChange={e => setField("maxPrice", e.target.value ? Number(e.target.value) : null)} />
        </div>
      </div>

      <FilterGroup
        title="Plataforma"
        singleSelect
        options={PLATFORMS}
        selected={workingFilters.platform ? [workingFilters.platform] : []}
        onToggle={(vals) => setField("platform", vals[0] ?? null)}
        onClear={() => clearField("platform")}
      />

      <FilterGroup
        title="Región"
        singleSelect
        options={REGIONS}
        selected={workingFilters.region ? [workingFilters.region] : []}
        onToggle={(vals) => setField("region", vals[0] ?? null)}
        onClear={() => clearField("region")}
      />

      <div className="mb-3">
        <label className="form-label">Lanzamiento (desde/hasta)</label>
        <div className="d-flex gap-2">
          <input type="date" className="form-control" value={workingFilters.releaseDateFrom ?? ""} onChange={e => setField("releaseDateFrom", e.target.value || null)} />
          <input type="date" className="form-control" value={workingFilters.releaseDateTo ?? ""} onChange={e => setField("releaseDateTo", e.target.value || null)} />
        </div>
      </div>

      <FilterGroup
        title="Desarrollador"
        singleSelect
        options={DEVELOPERS}
        selected={workingFilters.developer ? [workingFilters.developer] : []}
        onToggle={(vals) => setField("developer", vals[0] ?? null)}
        onClear={() => clearField("developer")}
      />

      <FilterGroup
        title="Publisher"
        singleSelect
        options={PUBLISHERS}
        selected={workingFilters.publisher ? [workingFilters.publisher] : []}
        onToggle={(vals) => setField("publisher", vals[0] ?? null)}
        onClear={() => clearField("publisher")}
      />

      <div className="mb-3">
        <label className="form-label">Metacritic (min / max)</label>
        <div className="d-flex gap-2">
          <input type="number" className="form-control" placeholder="Min" value={workingFilters.minMetacritic ?? ""} onChange={e => setField("minMetacritic", e.target.value ? Number(e.target.value) : null)} />
          <input type="number" className="form-control" placeholder="Max" value={workingFilters.maxMetacritic ?? ""} onChange={e => setField("maxMetacritic", e.target.value ? Number(e.target.value) : null)} />
        </div>
      </div>

      <FilterGroup
        title="Categorías"
        options={(categories || []).map(c => ({ value: c.id, label: c.description }))}
        selected={workingFilters.categories || []}
        showLimit={6}
        onToggle={(vals) => setField("categories", vals)}
      />

      <div className="mb-3">
        <label className="form-label">Puntuación promedio (mín)</label>
        <div className="d-flex gap-2 align-items-center">
          <input type="range" min="0" max="5" step="0.5" value={workingFilters.minAvgRating ?? 0} onChange={e => setField("minAvgRating", Number(e.target.value))} />
          <div style={{width:40}}>{(workingFilters.minAvgRating ?? 0).toFixed(1)}</div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Ventas mínimas</label>
        <input type="number" className="form-control" placeholder="0" value={workingFilters.minSold ?? ""} onChange={e => setField("minSold", e.target.value ? Number(e.target.value) : null)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Descuento % mínimo</label>
        <input type="number" className="form-control" placeholder="0" value={workingFilters.minDiscountPct ?? ""} onChange={e => setField("minDiscountPct", e.target.value ? Number(e.target.value) : null)} />
      </div>

      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary flex-grow-1" onClick={handleApplyClick}>Aplicar</button>
        <button className="btn btn-outline-secondary" onClick={onClearAll}>Limpiar</button>
      </div>
    </div>
  );
}
