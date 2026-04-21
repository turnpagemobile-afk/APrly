import { motion } from "framer-motion";

export function CreditScoreGauge({ score, delta, band }: { score: number; delta: number; band: string }) {
  const maxScore = 850;
  const minScore = 300;
  const percentage = Math.max(0, Math.min(100, ((score - minScore) / (maxScore - minScore)) * 100));
  
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference * 0.75; // 0.75 for a 270-degree arc

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <svg className="transform -rotate-135 w-48 h-48" viewBox="0 0 200 200">
        {/* Background Arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        />
      </svg>
      <div className="absolute flex flex-col items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-2">
        <span className="text-4xl font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          {score}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">
          {band}
        </span>
        {delta !== 0 && (
          <span className={`text-xs mt-1 font-medium ${delta > 0 ? "text-green-400" : "text-red-400"}`}>
            {delta > 0 ? "+" : ""}{delta} pts
          </span>
        )}
      </div>
    </div>
  );
}
