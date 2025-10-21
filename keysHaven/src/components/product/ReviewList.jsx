import React, { useState } from "react";
import PaginationBar from "../catalog/PaginationBar";
import Rating from "../catalog/Rating";

export default function ReviewList({ reviews = [], pageSize = 4 }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((reviews.length || 0) / pageSize));
  const start = (page - 1) * pageSize;
  const pageContent = reviews.slice(start, start + pageSize);

  return (
    <div>
      <div>
        {pageContent.map(r => (
          <div key={r.id} className="review-item">
            <div style={{ width: 56 }}>
              <div className="review-avatar">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12 }}>Usuario</div>
                  <div style={{ fontWeight: 700 }}>{r.buyerId}</div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <div style={{ color: "var(--text)", fontWeight: 700 }}>{r.title || `Usuario ${r.buyerId}`}</div>
                  <div className="review-meta muted">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Rating value={r.rating} size={14} />
                </div>
              </div>
              <div className="review-comment mt-1">{r.comment}</div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-center mt-3">
          <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
