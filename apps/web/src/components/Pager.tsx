interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}

export default function Pager({ page, pageSize, total, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="pager" aria-label="Issue pages">
      <button className="button button-quiet" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ← <span>Previous</span>
      </button>
      <span className="pager-current">
        Page <b>{page}</b> of {pages}
      </span>
      <button
        className="button button-quiet"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        <span>Next</span> →
      </button>
    </nav>
  );
}
