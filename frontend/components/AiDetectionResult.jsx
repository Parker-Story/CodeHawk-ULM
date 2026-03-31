"use client";

/**
 * AiDetectionResult
 * Displays the AI detection result returned from Spring Boot.
 *
 * Props
 * -----
 * detection : {
 *   ai_probability : number   0.0 – 1.0
 *   ai_percentage  : number   0.0 – 100.0
 *   label          : string   "AI" | "Human" | "Uncertain" | "Unavailable"
 *   confidence     : string   "High" | "Medium" | "Low"
 * }
 */
export default function AiDetectionResult({ detection }) {
    if (!detection) return null;

    const { ai_percentage, label, confidence } = detection;
    const pct = ai_percentage ?? 0;

    const scheme = {
        AI:          { bar: "bg-red-500",    badge: "bg-red-500/20 text-red-400 border-red-500/30",       icon: "⚠" },
        Human:       { bar: "bg-green-500",  badge: "bg-green-500/20 text-green-400 border-green-500/30", icon: "✓" },
        Uncertain:   { bar: "bg-yellow-500", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: "?" },
        Unavailable: { bar: "bg-zinc-500",   badge: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",    icon: "–" },
    }[label] ?? { bar: "bg-zinc-500", badge: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", icon: "–" };

    const description = {
        AI:          "This submission shows strong indicators of AI-generated code.",
        Human:       "This submission appears to be written by a human.",
        Uncertain:   "This submission has mixed indicators. Manual review is recommended.",
        Unavailable: "AI detection was unavailable for this submission.",
    }[label] ?? "";

    return (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">AI Detection Result</h2>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${scheme.badge}`}>
                    <span>{scheme.icon}</span>
                    {label}
                </span>
            </div>

            {/* Probability bar */}
            <div className="mb-6">
                <div className="flex items-end justify-between mb-2">
                    <span className="text-sm text-zinc-400">AI-Generated Probability</span>
                    <span className="text-2xl font-bold text-white tabular-nums">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-700/60 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${scheme.bar}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-zinc-500">0% — Human</span>
                    <span className="text-[10px] text-zinc-500">50% — Uncertain</span>
                    <span className="text-[10px] text-zinc-500">100% — AI</span>
                </div>
            </div>

            {/* Confidence + description */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/60">
                <div className="flex-1">
                    <p className="text-sm text-zinc-300">{description}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Confidence</p>
                    <p className={`text-sm font-semibold ${
                        confidence === "High"   ? "text-white"    :
                        confidence === "Medium" ? "text-zinc-300" : "text-zinc-400"
                    }`}>{confidence}</p>
                </div>
            </div>

            {/* Zone legend */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                    { range: "0 – 35%",   label: "Human",     color: "text-green-400"  },
                    { range: "35 – 65%",  label: "Uncertain", color: "text-yellow-400" },
                    { range: "65 – 100%", label: "AI",        color: "text-red-400"    },
                ].map(({ range, label: l, color }) => (
                    <div key={l} className="rounded-lg bg-zinc-800/40 px-2 py-2">
                        <p className={`text-xs font-medium ${color}`}>{l}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{range}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
