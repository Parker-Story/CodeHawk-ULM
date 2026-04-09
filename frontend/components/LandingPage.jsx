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
} from "lucide-react";

function BrandWord() {
  return (
    <>
      Code<span className="text-[#FE9F2B]">Hawk</span>
    </>
  );
}

function FeatureCard({ icon: Icon, title, items }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:border-zinc-600">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800"
          aria-hidden
        >
          <Icon className="h-5 w-5 text-[#FE9F2B]" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-zinc-400">
        {items.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300 dark:bg-zinc-600" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [demoRan, setDemoRan] = useState(false);

  const goLogin = () => router.push("/login");

  return (
    <div className="min-h-screen bg-white text-gray-900 text-[15px] dark:bg-zinc-800 dark:text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            <BrandWord />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goLogin}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#7C1D2E] transition-opacity hover:opacity-90"
            >
              Log in
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* 1. Hero: purpose & CTAs */}
        <section className="border-b border-gray-200/80 bg-linear-to-b from-gray-100 to-white px-4 py-20 sm:py-28 dark:border-zinc-700/80 dark:from-zinc-900/40 dark:to-zinc-800">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl dark:text-white">
              Automated code grading with custom test cases
            </h1>
            <p className="mt-5 text-lg text-gray-600 sm:text-xl dark:text-zinc-400">
              Code<span className="text-[#FE9F2B]">Hawk</span> helps instructors create programming
              assignments and test suites, while students submit code and get fast, consistent
              feedback. Built for courses that need reliable autograding, not just a file drop box.
            </p>
            <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={goLogin}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white bg-[#7C1D2E] transition-opacity hover:opacity-90"
              >
                <GraduationCap className="h-5 w-5 shrink-0" aria-hidden />
                Log in to CodeHawk
              </button>
            </div>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="#demo"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "#FE9F2B" }}
              >
                <Code2 className="h-5 w-5" aria-hidden />
                View sample problem
              </a>
              <span className="hidden text-gray-300 sm:inline dark:text-zinc-600">·</span>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
              >
                How it works
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </section>

        {/* 2. Workflow */}
        <section
          id="how-it-works"
          className="scroll-mt-28 border-b border-gray-200/80 px-4 py-20 sm:py-24 dark:border-zinc-700/80"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600 dark:text-zinc-400">
              Two roles, one system: faculty publish structured problems; students submit code and see
              results from the same tests every time.
            </p>

            <div className="mt-12 grid gap-12 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-zinc-700">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C1D2E]/10 dark:bg-[#7C1D2E]/20"
                  >
                    <BookOpen className="h-5 w-5 text-[#FE9F2B]" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Instructor flow</h3>
                </div>
                <ol className="mt-6 space-y-4 text-gray-700 dark:text-zinc-300">
                  <li className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "#7C1D2E" }}
                    >
                      1
                    </span>
                    <span>
                      <strong className="text-gray-900 dark:text-white">Create an assignment</strong> with a title,
                      description, and due date.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "#7C1D2E" }}
                    >
                      2
                    </span>
                    <span>
                      Define the problem: <strong className="text-gray-900 dark:text-white">what to build</strong>,{" "}
                      <strong className="text-gray-900 dark:text-white">constraints</strong>, and how{" "}
                      <strong className="text-gray-900 dark:text-white">input and output</strong> should look.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "#7C1D2E" }}
                    >
                      3
                    </span>
                    <span>
                      Add <strong className="text-gray-900 dark:text-white">test cases</strong>: mark some as visible to
                      students for debugging, and keep others hidden for final grading.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "#7C1D2E" }}
                    >
                      4
                    </span>
                    <span>
                      Set <strong className="text-gray-900 dark:text-white">rubrics and scoring</strong>, then{" "}
                      <strong className="text-gray-900 dark:text-white">publish</strong> when the class is ready.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-zinc-700">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C1D2E]/10 dark:bg-[#7C1D2E]/20"
                  >
                    <GraduationCap className="h-5 w-5 text-[#FE9F2B]" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student flow</h3>
                </div>
                <ol className="mt-6 space-y-4 text-gray-700 dark:text-zinc-300">
                  <li className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "#7C1D2E" }}
                    >
                      1
                    </span>
                    <span>
                      Open the course assignment and read the <strong className="text-gray-900 dark:text-white">problem</strong>{" "}
                      and public sample tests.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "#7C1D2E" }}
                    >
                      2
                    </span>
                    <span>
                      <strong className="text-gray-900 dark:text-white">Write or upload</strong> your source code in the
                      supported language.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "#7C1D2E" }}
                    >
                      3
                    </span>
                    <span>
                      <strong className="text-gray-900 dark:text-white">Submit</strong>, and the system compiles and runs your
                      program against the grader&apos;s tests.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "#7C1D2E" }}
                    >
                      4
                    </span>
                    <span>
                      Get a <strong className="text-gray-900 dark:text-white">verdict</strong> (pass/fail per test),{" "}
                      <strong className="text-gray-900 dark:text-white">score</strong> when released, and feedback such as
                      errors or resource usage when available.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features */}
        <section id="features" className="scroll-mt-28 border-b border-gray-200/80 px-4 py-20 sm:py-24 dark:border-zinc-700/80">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">What CodeHawk does</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600 dark:text-zinc-400">
              These are the capabilities the platform is built around today.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={FlaskConical}
                title="Autograding engine"
                items={[
                  "Supports Python and Java submissions",
                  "Runs in a sandboxed execution path with timeouts",
                  "Surfaces compilation and runtime errors when runs fail",
                  "Same tests for every student (deterministic grading)",
                ]}
              />
              <FeatureCard
                icon={Layers}
                title="Test cases"
                items={[
                  "Public tests students can use while coding",
                  "Hidden tests reserved for grading",
                  "Test suites you can reuse and attach to assignments",
                  "Expected output comparison for standard I/O style problems",
                ]}
              />
              <FeatureCard
                icon={FileCheck}
                title="Scoring & rubrics"
                items={[
                  "Rubric-based scoring tied to your assignment",
                  "Automatic grading hooks when tests are present",
                  "Room for instructor review and manual adjustments where you need them",
                ]}
              />
              <FeatureCard
                icon={ClipboardList}
                title="Feedback"
                items={[
                  "Output comparison against expected results",
                  "Messages for compile errors, runtime errors, and wrong answers",
                  "Execution details when the pipeline exposes time and memory",
                ]}
              />
              <FeatureCard
                icon={Eye}
                title="Instructor visibility"
                items={[
                  "Dashboard for courses and assignments",
                  "Submission lists and grading workflows",
                  "Optional plagiarism-style similarity check between submissions on an assignment",
                ]}
              />
              <FeatureCard
                icon={Users}
                title="Roles"
                items={[
                  "Students submit and track work",
                  "Faculty create and publish assignments",
                  "Teaching assistants can work within the course tools where you grant access",
                ]}
              />
            </div>
          </div>
        </section>

        {/* 4. Sample problem (static preview) */}
        <section id="demo" className="scroll-mt-28 border-b border-gray-200/80 px-4 py-20 sm:py-24 dark:border-zinc-700/80">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Sample problem</h2>
            <p className="mt-3 text-center text-gray-600 dark:text-zinc-400">
              A quick preview of the kind of task students see. This page doesn&apos;t run your code on
              our servers. Sign in to use the real editor and grader.
            </p>

            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-7 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900/60">
              <h3 className="font-semibold text-gray-900 dark:text-white">Sum two numbers (example)</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                Read two integers from standard input, print their sum on one line.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-zinc-500">
                <span className="rounded-md bg-gray-100 px-2 py-1 font-mono dark:bg-zinc-800">Public sample</span>
                <span className="rounded-md bg-gray-100 px-2 py-1 font-mono dark:bg-zinc-800">Input: (a = 2, b = 3) → Output: 5</span>
              </div>

              <pre className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-gray-100 p-4 text-left text-sm text-gray-800 font-mono dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
                <code>{`# Python (illustration only)
a, b = map(int, input().split())
print(a + b)`}</code>
              </pre>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setDemoRan(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-[#7C1D2E] transition-opacity hover:opacity-90"
                >
                  Run sample (demo)
                </button>
              </div>

              {demoRan && (
                <div
                  className="mt-4 rounded-xl border border-gray-300 bg-gray-100 p-4 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  role="status"
                >
                  <p className="font-medium text-gray-900 dark:text-white">Simulated output</p>
                  <pre className="mt-2 font-mono text-gray-700 dark:text-zinc-300">5</pre>
                  <p className="mt-2 text-xs text-gray-500 dark:text-zinc-500">
                    In the live app, your code runs against all public and hidden tests for the
                    assignment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6–7 Instructor & Student */}
        <section className="border-b border-gray-200/80 px-4 py-20 sm:py-24 dark:border-zinc-700/80">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <BarChart3 className="h-6 w-6 text-[#FE9F2B]" aria-hidden />
                <h2 className="text-xl font-bold">For instructors</h2>
              </div>
              <ul className="mt-5 space-y-3 text-gray-600 dark:text-zinc-400">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/90" aria-hidden />
                  Course and assignment dashboard to create and publish work
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/90" aria-hidden />
                  Test case editor with visible vs hidden tests
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/90" aria-hidden />
                  Due dates on assignments to keep your course on schedule
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/90" aria-hidden />
                  View submissions and run similarity checks to support academic integrity
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Code2 className="h-6 w-6 text-[#FE9F2B]" aria-hidden />
                <h2 className="text-xl font-bold">For students</h2>
              </div>
              <ul className="mt-5 space-y-3 text-gray-600 dark:text-zinc-400">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/90" aria-hidden />
                  Clear problem statements and sample tests where instructors provide them
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/90" aria-hidden />
                  Submit code and see autograder results and scores when your instructor releases them
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/90" aria-hidden />
                  Submission history tied to each assignment
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500/90" aria-hidden />
                  Faster iteration than email attachments and manual runs
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8–9 Security & scale */}
        <section className="border-b border-gray-200/80 px-4 py-20 sm:py-24 dark:border-zinc-700/80">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="h-6 w-6 text-[#FE9F2B]" aria-hidden />
                  <h2 className="text-xl font-bold">Security &amp; fairness</h2>
                </div>
                <p className="mt-4 text-gray-600 dark:text-zinc-400">
                  Submissions run under resource limits and timeouts. Hidden test cases mean students
                  cannot tune answers only to public samples. Together with instructor-controlled
                  rubrics, you keep grading transparent on your terms.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Timer className="h-6 w-6 text-[#FE9F2B]" aria-hidden />
                  <h2 className="text-xl font-bold">Built for classroom load</h2>
                </div>
                <p className="mt-4 text-gray-600 dark:text-zinc-400">
                  The system is designed so many students can submit around the same deadline, with
                  grading jobs handled in a structured way, so your course keeps moving during peak weeks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10–11. Overview */}
        <section className="border-b border-gray-200/80 px-4 py-20 sm:py-24 dark:border-zinc-700/80">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              Who CodeHawk is for
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600 dark:text-zinc-400">
              A single place to manage coding assignments and grading for programming courses, across
              students, TAs, and faculty.
            </p>

            <div className="mt-10 flex flex-col gap-7">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800">
                    <School className="h-5 w-5 text-[#FE9F2B]" aria-hidden />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Who it&apos;s for</h2>
                </div>
                <p className="mt-4 text-gray-600 dark:text-zinc-400">
                  Universities and college programming courses, coding bootcamps, and any class that
                  needs consistent, repeatable autograding instead of hand-running every program.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800">
                    <Code2 className="h-5 w-5 text-[#FE9F2B]" aria-hidden />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">What CodeHawk does</h2>
                </div>
                <p className="mt-4 text-gray-600 dark:text-zinc-400">
                  Instructors publish coding assignments with tests and grading rules. Students submit
                  their code and get consistent results. The same checks run for everyone, so grading
                  stays fair and instructors can focus on teaching instead of repetitive manual
                  validation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 12–13 Access & auth */}
        <section className="border-b border-gray-200/80 px-4 py-20 sm:py-24 dark:border-zinc-700/80">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Get access</h2>
            <p className="mt-4 text-gray-600 dark:text-zinc-400">
              Create an account with your email. You&apos;ll choose <strong className="text-gray-800 dark:text-zinc-200">Student</strong> or{" "}
              <strong className="text-gray-800 dark:text-zinc-200">Faculty</strong> when you register. Institutional rollout
              and licensing depend on your school. Ask your department if CodeHawk is already connected.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={goLogin}
                className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white bg-[#7C1D2E] transition-opacity hover:opacity-90"
              >
                Log in
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-zinc-500">Use your school email to create an account and sign in.</p>
          </div>
        </section>
      </main>

      {/* 14. Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-12 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                <BrandWord />
              </p>
              <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-zinc-500">
                A simple platform for programming courses: assignments, autograding, and integrity
                checks, built for students, TAs, and faculty.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-500">
              <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
                Students
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
                TAs
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
                Faculty
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400 sm:text-left dark:border-zinc-800 dark:text-zinc-600">
            © {new Date().getFullYear()} CodeHawk. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
