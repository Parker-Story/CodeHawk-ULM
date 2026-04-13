"use client";

/**
 * AiDetectionBadge
 * Compact badge for use inside submission tables (faculty + TA views).
 *
 * Props
 * -----
 * submission : {
 *   aiLabel      : string   "AI" | "Human" | "Uncertain" | "Unavailable" | null
 *   aiPercentage : number   0.0 – 100.0 | null
 *   aiConfidence : string   "High" | "Medium" | "Low" | null
 * }
 */
export default function AiDetectionBadge({ submission }) {
    const label      = submission?.label;
    const percentage = submission?.aiPercentage;
    const confidence = submission?.confidence;

    // Not yet analyzed
    if (!label || label === "Unavailable") {
        return <span className="text-zinc-600 text-sm">—</span>;
    }

    const scheme = {
        AI:        { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       bar: "bg-red-500"    },
        Human:     { color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   bar: "bg-green-500"  },
        Uncertain: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", bar: "bg-yellow-500" },
    }[label] ?? { color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20", bar: "bg-zinc-500" };

    return (
        <div className="flex flex-col gap-1 min-w-[100px]">
            {/* Label + percentage */}
            <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${scheme.bg} ${scheme.color}`}>
                    {label}
                </span>
                <span className="text-xs text-zinc-400 tabular-nums">
                    {percentage != null ? `${percentage.toFixed(1)}%` : ""}
                </span>
            </div>

            {/* Mini probability bar */}
            {percentage != null && (
                <div className="h-1.5 w-full rounded-full bg-zinc-700/50 overflow-hidden">
                    <div
                        className={`h-full rounded-full ${scheme.bar}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            )}

            {/* Confidence */}
            {confidence && (
                <span className="text-[10px] text-zinc-500">{confidence} confidence</span>
            )}
        </div>
    );
}
