'use client';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ size = 32, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <path
          d="M16 4a12 12 0 0 1 12 12"
          stroke="#1e40af"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
