"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Code2,
  FlaskConical,
  Shield,
  Layers,
  Eye,
  FileCheck,
  Timer,
  Users,
  School,
  ArrowRight,
  ClipboardList,
  BarChart3,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

/* —— palette: maroon / near-black / gold accent (ULM-adjacent, not purple) —— */
const M = {
  maroon: "#7C1D2E",
  maroonDeep: "#4a1018",
  gold: "#C9A84C",
  glow: "rgba(124, 29, 46, 0.35)",
  /** Hero wash — reads as light on the canopy without going bright */
  heroGlow: "rgba(124, 29, 46, 0.42)",
  heroGlowSoft: "rgba(124, 29, 46, 0.18)",
};

function BrandWord() {
  return (
    <>
      Code<span style={{ color: M.gold }}>Hawk</span>
    </>
  );
}

/** Glass panel + border; restrained depth */
function GlassPanel({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.1] bg-white/[0.055] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_20px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300 hover:border-[#7C1D2E]/25 hover:bg-white/[0.065] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_52px_-18px_rgba(124,29,46,0.28),0_24px_48px_-24px_rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Feature: title + one-line hook; full bullets inside <details> (all team copy kept) */
function FeatureExpandCard({ icon: Icon, title, hook, items }) {
  return (
    <details className="group rounded-2xl border border-white/[0.11] bg-white/[0.075] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_0_36px_-20px_rgba(124,29,46,0.2)] backdrop-blur-lg transition-[border-color,box-shadow,background-color] duration-300 hover:border-[#7C1D2E]/45 hover:bg-white/[0.095] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.055)_inset,0_0_64px_-12px_rgba(124,29,46,0.38),0_0_40px_-20px_rgba(124,29,46,0.22)] open:border-[#7C1D2E]/38 open:bg-white/[0.09] open:shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_56px_-14px_rgba(124,29,46,0.32)]">
      <summary className="cursor-pointer list-none select-none px-5 py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30"
            aria-hidden
          >
            <Icon className="h-5 w-5" style={{ color: M.gold }} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="font-semibold tracking-tight text-zinc-100">{title}</h3>
            <p className="mt-1.5 text-sm leading-snug text-zinc-400">{hook}</p>
          </div>
          <ChevronDown
            className="mt-1 h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          />
        </div>
        <span className="mt-3 block text-xs font-medium uppercase tracking-wider text-zinc-500 group-open:hidden">
          Tap for full details
        </span>
      </summary>
      <ul className="space-y-2.5 border-t border-white/[0.06] px-5 pb-5 pt-4 text-sm leading-relaxed text-zinc-300">
        {items.map((line) => (
          <li key={line} className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#7C1D2E]/80" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Workflow column: short intro + expandable full steps */
function FlowColumn({ icon: Icon, title, intro, steps }) {
  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="border-b border-white/[0.06] bg-black/20 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7C1D2E]/30 bg-[#7C1D2E]/15">
            <Icon className="h-5 w-5" style={{ color: M.gold }} aria-hidden />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{intro}</p>
      </div>
      <details className="group border-t border-white/[0.04] bg-black/10">
        <summary className="cursor-pointer list-none px-6 py-4 text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-100 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            View all steps
            <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180" aria-hidden />
          </span>
        </summary>
        <ol className="space-y-4 px-6 pb-6 text-sm leading-relaxed text-zinc-300">
          {steps.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: M.maroon }}
              >
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </details>
    </GlassPanel>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [demoRan, setDemoRan] = useState(false);

  const goLogin = () => router.push("/login");

  const instructorSteps = [
    <>
      <strong className="text-zinc-100">Create an assignment</strong> with a title, description, and due date.
    </>,
    <>
      Define the problem: <strong className="text-zinc-100">what to build</strong>,{" "}
      <strong className="text-zinc-100">constraints</strong>, and how{" "}
      <strong className="text-zinc-100">input and output</strong> should look.
    </>,
    <>
      Add <strong className="text-zinc-100">test cases</strong>: mark some as visible to students for debugging, and keep
      others hidden for final grading.
    </>,
    <>
      Set <strong className="text-zinc-100">rubrics and scoring</strong>, then{" "}
      <strong className="text-zinc-100">publish</strong> when the class is ready.
    </>,
  ];

  const studentSteps = [
    <>
      Open the course assignment and read the <strong className="text-zinc-100">problem</strong> and public sample tests.
    </>,
    <>
      <strong className="text-zinc-100">Write or upload</strong> your source code in the supported language.
    </>,
    <>
      <strong className="text-zinc-100">Submit</strong>, and the system compiles and runs your program against the
      grader&apos;s tests.
    </>,
    <>
      Get a <strong className="text-zinc-100">verdict</strong> (pass/fail per test),{" "}
      <strong className="text-zinc-100">score</strong> when released, and feedback such as errors or resource usage when
      available.
    </>,
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080506] text-[15px] text-zinc-200 antialiased">
      {/* Layered depth: lifted mid-tones + maroon pools (not flat black) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 125% 90% at 50% -8%, ${M.heroGlow}, ${M.heroGlowSoft} 35%, transparent 58%),
              radial-gradient(ellipse 70% 50% at 100% 18%, rgba(124, 29, 46, 0.14), transparent 52%),
              radial-gradient(ellipse 55% 42% at 0% 72%, rgba(74, 16, 24, 0.28), transparent 48%),
              radial-gradient(ellipse 80% 45% at 50% 108%, rgba(0, 0, 0, 0.55), transparent 45%),
              linear-gradient(180deg, #150a0d 0%, #0d0608 18%, #080506 42%, #050304 68%, #020101 100%)
            `,
          }}
        />
        {/* faint “columns” / academic grid — very low contrast */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 72px, rgba(201,168,76,0.14) 72px, rgba(201,168,76,0.14) 73px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.12] to-black/75" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080506]/78 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="text-xl font-bold tracking-tight text-zinc-100">
              <BrandWord />
            </div>
            <button
              type="button"
              onClick={goLogin}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(124,29,46,0.55)] transition-[transform,opacity,box-shadow] duration-150 hover:opacity-95 active:scale-[0.98]"
              style={{ background: M.maroon }}
            >
              Log in
            </button>
          </nav>
        </header>

        <main>
          {/* —— Hero —— */}
          <section className="relative border-b border-white/[0.06] px-4 pb-24 pt-16 sm:pb-32 sm:pt-20">
            {/* Strong maroon radial behind hero — top feels illuminated */}
            <div
              className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 opacity-[0.95] sm:-top-32"
              style={{
                background: `
                  radial-gradient(ellipse 95% 72% at 50% 0%, rgba(124, 29, 46, 0.55), rgba(124, 29, 46, 0.22) 38%, transparent 62%),
                  radial-gradient(ellipse 70% 55% at 50% 8%, rgba(201, 168, 76, 0.06), transparent 50%)
                `,
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#7C1D2E]/18 via-[#7C1D2E]/5 to-transparent" />
            <div className="relative mx-auto max-w-6xl">
              <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl md:text-[2.65rem] md:leading-[1.12]">
                    Automated code grading with custom test cases
                  </h1>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                    Code<span style={{ color: M.gold }}>Hawk</span> helps instructors create programming assignments and test
                    suites, while students submit code and get fast, consistent feedback. Built for courses that need reliable
                    autograding, not just a file drop box.
                  </p>
                  <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <button
                      type="button"
                      onClick={goLogin}
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_-6px_rgba(124,29,46,0.65)] transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.98]"
                      style={{ background: M.maroon }}
                    >
                      <GraduationCap className="h-5 w-5 shrink-0" aria-hidden />
                      Log in to CodeHawk
                    </button>
                    <a
                      href="#demo"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-colors hover:border-[#7C1D2E]/40 hover:bg-white/[0.06]"
                    >
                      <Code2 className="h-5 w-5" style={{ color: M.gold }} aria-hidden />
                      View sample problem
                    </a>
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center justify-center gap-2 px-2 py-3 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      How it works
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </div>

                {/* Device-style mockup — layered depth, no external asset */}
                <div className="relative mx-auto w-full max-w-md lg:mx-0">
                  <div
                    className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${M.glow}, transparent 70%)` }}
                  />
                  <div className="relative rounded-2xl border border-white/10 bg-zinc-950/80 p-1 shadow-2xl shadow-black/60 backdrop-blur-sm">
                    <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      </div>
                      <span className="ml-2 flex-1 truncate text-center text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                        codehawk — assignment
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="h-2 w-[55%] rounded bg-zinc-800" />
                      <div className="h-2 w-full rounded bg-zinc-800/80" />
                      <div className="h-2 w-[80%] rounded bg-zinc-800/60" />
                      <div className="mt-4 rounded-lg border border-white/5 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                        <span className="text-emerald-600/90">●</span> public tests passed
                        <br />
                        <span className="text-zinc-600">… hidden tests on submit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* —— Quick stats —— */}
          <section className="border-b border-white/[0.06] px-4 py-10">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { k: "Roles", v: "Students · TAs · Faculty" },
                { k: "Tests", v: "Public + hidden suites" },
                { k: "Focus", v: "Fair, repeatable runs" },
                { k: "Built for", v: "Programming courses" },
              ].map(({ k, v }) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-center backdrop-blur-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{k}</p>
                  <p className="mt-1.5 text-sm font-medium text-zinc-200">{v}</p>
                </div>
              ))}
            </div>
          </section>

          {/* —— How it works —— */}
          <section id="how-it-works" className="scroll-mt-28 border-b border-white/[0.06] px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">How it works</h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
                Two roles, one system: faculty publish structured problems; students submit code and see results from the same
                tests every time.
              </p>

              <div className="mt-14 grid gap-8 lg:grid-cols-2">
                <FlowColumn
                  icon={BookOpen}
                  title="Instructor flow"
                  intro="From assignment setup through rubrics and publish—structured for your course."
                  steps={instructorSteps}
                />
                <FlowColumn
                  icon={GraduationCap}
                  title="Student flow"
                  intro="Read the spec, code, submit, and get clear verdicts when grading is released."
                  steps={studentSteps}
                />
              </div>
            </div>
          </section>

          {/* —— Features —— */}
          <section id="features" className="scroll-mt-28 border-b border-white/[0.06] px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">What CodeHawk does</h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-400 sm:text-base">
                These are the capabilities the platform is built around today.
              </p>

              <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <FeatureExpandCard
                  icon={FlaskConical}
                  title="Autograding engine"
                  hook="Python and Java, sandboxed runs, deterministic grading."
                  items={[
                    "Supports Python and Java submissions",
                    "Runs in a sandboxed execution path with timeouts",
                    "Surfaces compilation and runtime errors when runs fail",
                    "Same tests for every student (deterministic grading)",
                  ]}
                />
                <FeatureExpandCard
                  icon={Layers}
                  title="Test cases"
                  hook="Public tests for debugging; hidden tests for real grading."
                  items={[
                    "Public tests students can use while coding",
                    "Hidden tests reserved for grading",
                    "Test suites you can reuse and attach to assignments",
                    "Expected output comparison for standard I/O style problems",
                  ]}
                />
                <FeatureExpandCard
                  icon={FileCheck}
                  title="Scoring & rubrics"
                  hook="Rubric-based scoring with room for instructor review."
                  items={[
                    "Rubric-based scoring tied to your assignment",
                    "Automatic grading hooks when tests are present",
                    "Room for instructor review and manual adjustments where you need them",
                  ]}
                />
                <FeatureExpandCard
                  icon={ClipboardList}
                  title="Feedback"
                  hook="Output comparison, errors, and execution details when available."
                  items={[
                    "Output comparison against expected results",
                    "Messages for compile errors, runtime errors, and wrong answers",
                    "Execution details when the pipeline exposes time and memory",
                  ]}
                />
                <FeatureExpandCard
                  icon={Eye}
                  title="Instructor visibility"
                  hook="Dashboards, submissions, grading workflows, similarity checks."
                  items={[
                    "Dashboard for courses and assignments",
                    "Submission lists and grading workflows",
                    "Optional plagiarism-style similarity check between submissions on an assignment",
                  ]}
                />
                <FeatureExpandCard
                  icon={Users}
                  title="Roles"
                  hook="Students, faculty, and TAs where you grant access."
                  items={[
                    "Students submit and track work",
                    "Faculty create and publish assignments",
                    "Teaching assistants can work within the course tools where you grant access",
                  ]}
                />
              </div>
            </div>
          </section>

          {/* —— Sample problem —— */}
          <section id="demo" className="scroll-mt-28 border-b border-white/[0.06] px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">Sample problem</h2>
              <p className="mt-3 text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
                A quick preview of the kind of task students see. This page doesn&apos;t run your code on our servers. Sign in
                to use the real editor and grader.
              </p>

              <GlassPanel className="mt-10 p-7 sm:p-8">
                <h3 className="font-semibold text-zinc-100">Sum two numbers (example)</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Read two integers from standard input, print their sum on one line.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono">Public sample</span>
                  <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono">
                    Input: (a = 2, b = 3) → Output: 5
                  </span>
                </div>

                <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 text-left font-mono text-sm text-zinc-300">
                  <code>{`# Python (illustration only)
a, b = map(int, input().split())
print(a + b)`}</code>
                </pre>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setDemoRan(true)}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: M.maroon }}
                  >
                    Run sample (demo)
                  </button>
                </div>

                {demoRan && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 text-sm" role="status">
                    <p className="font-medium text-zinc-100">Simulated output</p>
                    <pre className="mt-2 font-mono text-zinc-300">5</pre>
                    <p className="mt-2 text-xs text-zinc-500">
                      In the live app, your code runs against all public and hidden tests for the assignment.
                    </p>
                  </div>
                )}
              </GlassPanel>
            </div>
          </section>

          {/* —— Instructor & Student —— */}
          <section className="border-b border-white/[0.06] px-4 py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              <GlassPanel className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-zinc-100">
                  <BarChart3 className="h-6 w-6 shrink-0" style={{ color: M.gold }} aria-hidden />
                  <h2 className="text-xl font-bold tracking-tight">For instructors</h2>
                </div>
                <details className="group mt-5">
                  <summary className="cursor-pointer list-none text-sm text-zinc-400 [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-2 font-medium text-zinc-300 hover:text-zinc-100">
                      See all instructor benefits
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                    </span>
                  </summary>
                  <ul className="mt-4 space-y-3 border-t border-white/[0.06] pt-4 text-sm leading-relaxed text-zinc-400">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/85" aria-hidden />
                      Course and assignment dashboard to create and publish work
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/85" aria-hidden />
                      Test case editor with visible vs hidden tests
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/85" aria-hidden />
                      Due dates on assignments to keep your course on schedule
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/85" aria-hidden />
                      View submissions and run similarity checks to support academic integrity
                    </li>
                  </ul>
                </details>
              </GlassPanel>
              <GlassPanel className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-zinc-100">
                  <Code2 className="h-6 w-6 shrink-0" style={{ color: M.gold }} aria-hidden />
                  <h2 className="text-xl font-bold tracking-tight">For students</h2>
                </div>
                <details className="group mt-5">
                  <summary className="cursor-pointer list-none text-sm text-zinc-400 [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-2 font-medium text-zinc-300 hover:text-zinc-100">
                      See all student benefits
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                    </span>
                  </summary>
                  <ul className="mt-4 space-y-3 border-t border-white/[0.06] pt-4 text-sm leading-relaxed text-zinc-400">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/85" aria-hidden />
                      Clear problem statements and sample tests where instructors provide them
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/85" aria-hidden />
                      Submit code and see autograder results and scores when your instructor releases them
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/85" aria-hidden />
                      Submission history tied to each assignment
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/85" aria-hidden />
                      Faster iteration than email attachments and manual runs
                    </li>
                  </ul>
                </details>
              </GlassPanel>
            </div>
          </section>

          {/* —— Security & scale —— */}
          <section className="border-b border-white/[0.06] px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-8 md:grid-cols-2">
                <GlassPanel className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-zinc-100">
                    <Shield className="h-6 w-6 shrink-0" style={{ color: M.gold }} aria-hidden />
                    <h2 className="text-xl font-bold tracking-tight">Security &amp; fairness</h2>
                  </div>
                  <details className="group mt-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-zinc-400 hover:text-zinc-200 [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2">
                        Read full explanation
                        <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180" aria-hidden />
                      </span>
                    </summary>
                    <p className="mt-3 border-t border-white/[0.06] pt-3 text-sm leading-relaxed text-zinc-400">
                      Submissions run under resource limits and timeouts. Hidden test cases mean students cannot tune answers
                      only to public samples. Together with instructor-controlled rubrics, you keep grading transparent on your
                      terms.
                    </p>
                  </details>
                </GlassPanel>
                <GlassPanel className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-zinc-100">
                    <Timer className="h-6 w-6 shrink-0" style={{ color: M.gold }} aria-hidden />
                    <h2 className="text-xl font-bold tracking-tight">Built for classroom load</h2>
                  </div>
                  <details className="group mt-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-zinc-400 hover:text-zinc-200 [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2">
                        Read full explanation
                        <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180" aria-hidden />
                      </span>
                    </summary>
                    <p className="mt-3 border-t border-white/[0.06] pt-3 text-sm leading-relaxed text-zinc-400">
                      The system is designed so many students can submit around the same deadline, with grading jobs handled in
                      a structured way, so your course keeps moving during peak weeks.
                    </p>
                  </details>
                </GlassPanel>
              </div>
            </div>
          </section>

          {/* —— Who / What overview —— */}
          <section className="border-b border-white/[0.06] px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">Who CodeHawk is for</h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
                A single place to manage coding assignments and grading for programming courses, across students, TAs, and
                faculty.
              </p>

              <div className="mt-12 flex flex-col gap-6">
                <GlassPanel className="p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                      <School className="h-5 w-5" style={{ color: M.gold }} aria-hidden />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-100">Who it&apos;s for</h2>
                  </div>
                  <details className="group mt-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-zinc-500 hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
                      Expand full description
                      <ChevronDown className="ml-1 inline h-4 w-4 align-middle transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <p className="mt-3 border-t border-white/[0.06] pt-3 text-sm leading-relaxed text-zinc-400">
                      Universities and college programming courses, coding bootcamps, and any class that needs consistent,
                      repeatable autograding instead of hand-running every program.
                    </p>
                  </details>
                </GlassPanel>

                <GlassPanel className="p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                      <Code2 className="h-5 w-5" style={{ color: M.gold }} aria-hidden />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-100">What CodeHawk does</h2>
                  </div>
                  <details className="group mt-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-zinc-500 hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
                      Expand full description
                      <ChevronDown className="ml-1 inline h-4 w-4 align-middle transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <p className="mt-3 border-t border-white/[0.06] pt-3 text-sm leading-relaxed text-zinc-400">
                      Instructors publish coding assignments with tests and grading rules. Students submit their code and get
                      consistent results. The same checks run for everyone, so grading stays fair and instructors can focus on
                      teaching instead of repetitive manual validation.
                    </p>
                  </details>
                </GlassPanel>
              </div>
            </div>
          </section>

          {/* —— Get access —— */}
          <section className="border-b border-white/[0.06] px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">Get access</h2>
              <GlassPanel className="mt-8 px-6 py-8 sm:px-10">
                <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
                  Create an account with your email. You&apos;ll choose <strong className="text-zinc-200">Student</strong> or{" "}
                  <strong className="text-zinc-200">Faculty</strong> when you register. Institutional rollout and licensing
                  depend on your school. Ask your department if CodeHawk is already connected.
                </p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={goLogin}
                    className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_-6px_rgba(124,29,46,0.55)] transition-opacity hover:opacity-90"
                    style={{ background: M.maroon }}
                  >
                    Log in
                  </button>
                </div>
                <p className="mt-6 text-sm text-zinc-500">Use your school email to create an account and sign in.</p>
              </GlassPanel>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/[0.06] bg-black/40 px-4 py-12 backdrop-blur-md">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-bold text-zinc-100">
                  <BrandWord />
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                  A simple platform for programming courses: assignments, autograding, and integrity checks, built for
                  students, TAs, and faculty.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {["Students", "TAs", "Faculty"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-zinc-400"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-white/[0.06] pt-6 text-center text-xs text-zinc-600 sm:text-left">
              © {new Date().getFullYear()} CodeHawk. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
