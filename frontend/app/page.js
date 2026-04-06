"use client";

import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-800">
            <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Code<span style={{ color: "#C9A84C" }}>Hawk</span>
                </h1>
                <button
                    onClick={() => router.push("/login")}
                    className="px-5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors duration-200"
                >
                    Login
                </button>
            </nav>

            <main className="flex flex-col items-center justify-center h-[calc(100vh-73px)] gap-6">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        Code<span style={{ color: "#C9A84C" }}>Hawk</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">Code grading and plagiarism detection for academia.</p>
                </div>
                <button
                    onClick={() => router.push("/login")}
                    className="mt-4 px-8 py-3 text-sm font-semibold text-white rounded-lg transition-colors duration-200"
                    style={{ background: "#862633" }}
                >
                    Get Started
                </button>
            </main>
        </div>
    );
}