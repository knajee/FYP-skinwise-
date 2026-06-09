"use client";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-base">
      <div className="animate-pulse flex flex-col items-center">
        <div className="flex items-start">
          <span className="font-display italic text-4xl text-text-primary leading-none">
            Skin
          </span>
          <span className="font-sans font-semibold text-4xl text-text-primary leading-none tracking-tight">
            WISE
          </span>
        </div>
        <span className="mt-2 text-xs font-medium text-text-tertiary tracking-widest uppercase">
          Loading...
        </span>
      </div>
    </div>
  );
}
