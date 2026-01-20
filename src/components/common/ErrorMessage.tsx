import './ErrorMessage.css';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = '오류가 발생했습니다', message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <h3 className="error-title">{title}</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="error-retry-button" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}
