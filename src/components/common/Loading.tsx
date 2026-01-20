import './Loading.css';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = '로딩 중...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="loading">
      <div className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="loading-fullscreen">{content}</div>;
  }

  return content;
}

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px' }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius }}
    />
  );
}

export function SlotSkeleton() {
  return (
    <div className="slot-skeleton-grid">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} height="48px" borderRadius="8px" />
      ))}
    </div>
  );
}
