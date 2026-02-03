"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/faculty/courses"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        {/* Course Header */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-16 h-16 bg-teal-600/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Course Details</h1>
              <p className="text-teal-400 font-medium">CRN: {courseId}</p>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-slate-400">Course content will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
