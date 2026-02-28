"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiBase";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const crn = params.id;
  const [classItem, setClassItem] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/course/${crn}`)
      .then((res) => {
        if (!res.ok) throw new Error("Course not found");
        return res.json();
      })
      .then((data) => {
        setClassItem({ ...data, days: data.days ? data.days.split(",") : [] });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [crn]);

  useEffect(() => {
    fetch(`${API_BASE}/assignment/course/${crn}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assignments");
        return res.json();
      })
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading assignments:", err));
  }, [crn]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/students/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {!classItem ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400">Course not found.</p>
          </div>
        ) : (
          <>
            {/* Course Header */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-16 h-16 bg-orange-600/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{classItem.courseName}</h1>
                  <p className="text-orange-400 font-medium mt-1">{classItem.courseAbbreviation}</p>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="text-slate-300">
                      <span className="text-slate-500">CRN:</span> {classItem.crn}
                    </span>
                    <span className="text-slate-300">
                      <span className="text-slate-500">Semester:</span> {classItem.semester?.charAt(0).toUpperCase() + classItem.semester?.slice(1)} {classItem.year}
                    </span>
                    {classItem.days.length > 0 && (
                      <span className="text-slate-300">
                        <span className="text-slate-500">Days:</span> {classItem.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}
                      </span>
                    )}
                    {classItem.startTime && (
                      <span className="text-slate-300">
                        <span className="text-slate-500">Time:</span> {classItem.startTime} - {classItem.endTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {classItem.courseDescription && (
                <p className="mt-4 text-slate-400 text-sm">{classItem.courseDescription}</p>
              )}
            </div>

            {/* Assignments */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Assignments</h2>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl divide-y divide-slate-700/50">
                {assignments.length === 0 ? (
                  <p className="text-slate-400 p-4">No assignments yet.</p>
                ) : (
                  assignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-4 p-4 text-slate-300"
                    >
                      <FileText className="w-5 h-5 text-orange-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{a.title}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}