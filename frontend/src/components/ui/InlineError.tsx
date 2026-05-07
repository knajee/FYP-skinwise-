import { AlertCircle } from "lucide-react";

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export default function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-severity-severe/5 border border-severity-severe/10 rounded-xl">
      <AlertCircle size={24} className="text-severity-severe mb-3" />
      <p className="text-sm text-text-primary font-medium mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-severity-severe bg-severity-severe/10 hover:bg-severity-severe/20 px-4 py-1.5 rounded-full transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
