"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Clock } from "lucide-react";
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";

export default function FacultyArchivedPage() {
  const router = useRouter();
  const { classes } = useFacultyClasses();
  const archivedClasses = classes.filter((c) => c.archived);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Archived</h1>
        {archivedClasses.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-slate-400">No archived classes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedClasses.map((classItem) => (
              <div
                key={classItem.code}
                onClick={() => router.push(`/faculty/courses/${classItem.code}`)}
                className="relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-teal-600/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="text-lg font-semibold text-white truncate">{classItem.courseName}</h3>
                    <p className="text-teal-400 font-medium text-sm">{classItem.courseAbbreviation}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {classItem.courseDescription || "No description provided."}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    {classItem.days?.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}
                    {" · "}
                    {classItem.startTime} - {classItem.endTime}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-1">
                  <p className="text-slate-500 text-xs">
                    {classItem.semester?.charAt(0).toUpperCase() + classItem.semester?.slice(1)} {classItem.year}
                    {" · "}CRN: {classItem.crn}
                  </p>
                  <p className="text-xs font-medium text-teal-400">Class code: {classItem.code}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
