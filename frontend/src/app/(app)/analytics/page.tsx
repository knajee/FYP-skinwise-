export default function AnalyticsPage() {
  return (
    <div className="max-w-container mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-section text-white">Analytics</h1>
        <p className="text-xs-body text-slate-400 mt-1">Deep insights into your skin health trends</p>
      </div>

      {/* Empty state */}
      <div className="card-surface-1 p-12 flex flex-col items-center justify-center text-center">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mb-6 opacity-30">
          <polyline points="10,60 30,45 50,50 70,30 90,35 110,15" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="60" r="3" fill="#2DD4BF" opacity="0.5" />
          <circle cx="30" cy="45" r="3" fill="#2DD4BF" opacity="0.5" />
          <circle cx="50" cy="50" r="3" fill="#2DD4BF" opacity="0.5" />
          <circle cx="70" cy="30" r="3" fill="#2DD4BF" opacity="0.5" />
          <circle cx="90" cy="35" r="3" fill="#2DD4BF" opacity="0.5" />
          <circle cx="110" cy="15" r="3" fill="#2DD4BF" opacity="0.5" />
          <line x1="0" y1="70" x2="120" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>
        <h2 className="font-display text-xl text-white mb-2">
          Take 2 check-ins to see your trends
        </h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Analytics will show lesion trends, environmental correlations, and ingredient
          impact once you have enough data points.
        </p>
      </div>
    </div>
  );
}
