"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Code<span className="text-violet-400">Hawk</span>
        </h1>
        <button
          onClick={() => router.push("/login")}
          className="px-5 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors duration-200 shadow-lg shadow-violet-600/30"
        >
          Login
        </button>
      </nav>

      <main className="flex items-center justify-center h-[calc(100vh-73px)]">
        <h1 className="text-4xl font-bold text-white/80">Hello World</h1>
      </main>
    </div>
  );
}