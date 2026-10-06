export default function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-notice" role="alert">
      <span className="error-icon" aria-hidden="true">
        !
      </span>
      <div className="error-copy">
        <strong>We couldn’t load this just now.</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button className="button button-small button-quiet" type="button" onClick={onRetry}>
          Try again <span aria-hidden="true">↻</span>
        </button>
      )}
    </div>
  );
}
