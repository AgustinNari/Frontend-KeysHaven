import React from "react";

export default function PaginationBar({
  page,
  setPage,
  totalPages,
  pageWindow = 5,
}) {
  const total = Math.max(1, Number(totalPages) || 1);
  const current = Math.min(Math.max(1, Number(page) || 1), total);

  const currentGroup = Math.floor((current - 1) / pageWindow);
  const start = currentGroup * pageWindow + 1;
  const end = Math.min(start + pageWindow - 1, total);

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const goPrevPage = () => setPage(Math.max(1, current - 1));
  const goNextPage = () => setPage(Math.min(total, current + 1));
  const goPrevGroup = () => setPage(Math.max(1, start - pageWindow));
  const goNextGroup = () => setPage(Math.min(total, end + 1));

  return (
    <nav aria-label="Paginación">
      <ul className="pagination">
        <li className={"page-item " + (current === 1 ? "disabled" : "")}>
          <button
            className="page-link"
            onClick={goPrevPage}
            disabled={current === 1}
            aria-label="Página anterior"
          >
            ‹
          </button>
        </li>
        <li className={"page-item " + (start === 1 ? "disabled" : "")}>
          <button
            className="page-link"
            onClick={goPrevGroup}
            disabled={start === 1}
            aria-label="Grupo anterior"
            title={start === 1 ? "Inicio" : `Mostrar páginas ${Math.max(1, start - pageWindow)} - ${start - 1}`}
          >
            «
          </button>
        </li>
        {pages.map((p) => (
          <li key={p} className={"page-item " + (p === current ? "active" : "")}>
            <button
              className="page-link"
              onClick={() => setPage(p)}
              aria-current={p === current ? "page" : undefined}
            >
              {p}
            </button>
          </li>
        ))}
        <li className={"page-item " + (end === total ? "disabled" : "")}>
          <button
            className="page-link"
            onClick={goNextGroup}
            disabled={end === total}
            aria-label="Siguiente grupo"
            title={end === total ? "Fin" : `Mostrar páginas ${end + 1} - ${Math.min(total, end + pageWindow)}`}
          >
            »
          </button>
        </li>
        <li className={"page-item " + (current === total ? "disabled" : "")}>
          <button
            className="page-link"
            onClick={goNextPage}
            disabled={current === total}
            aria-label="Página siguiente"
          >
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
}
