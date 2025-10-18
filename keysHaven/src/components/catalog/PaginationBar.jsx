import React from "react";

export default function PaginationBar({ page, setPage, totalPages }) {
  const pages = [];
  for (let i=1;i<=totalPages;i++) pages.push(i);
  return (
    <nav>
      <ul className="pagination">
        <li className={"page-item " + (page===1 ? "disabled": "")}>
          <button className="page-link" onClick={()=> setPage(Math.max(1, page-1))}>‹</button>
        </li>
        {pages.map(p => (
          <li key={p} className={"page-item " + (p===page ? "active": "")}>
            <button className="page-link" onClick={()=> setPage(p)}>{p}</button>
          </li>
        ))}
        <li className={"page-item " + (page===totalPages ? "disabled": "")}>
          <button className="page-link" onClick={()=> setPage(Math.min(totalPages, page+1))}>›</button>
        </li>
      </ul>
    </nav>
  );
}
