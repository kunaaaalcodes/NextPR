export default function LoadingState({ label = "Loading issues" }: { label?: string }) {
  return (
    <div className="loading-stack" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((item) => (
        <div className="loading-card" key={item} aria-hidden="true">
          <span className="skeleton skeleton-short" />
          <span className="skeleton skeleton-title" />
          <span className="skeleton skeleton-meta" />
        </div>
      ))}
    </div>
  );
}
