"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, Upload, X } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const crn = params.id;
  const { user } = useAuth();
  const [classItem, setClassItem] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user?.cwid) return;
    setSubmitting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        const response = await fetch(`${API_BASE}/submission/submit/${selectedAssignment.id}/${user.cwid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selectedFile.name,
            fileContent: base64,
          }),
        });
        if (!response.ok) throw new Error("Submission failed");
        setSubmitted(true);
        setSubmitting(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error submitting:", error);
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedAssignment(null);
    setSelectedFile(null);
    setSubmitted(false);
    setSubmitting(false);
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Loading...</p></div>;
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
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedAssignment(a);
                        setSelectedFile(null);
                        setSubmitted(false);
                      }}
                      className="flex items-center gap-4 p-4 w-full text-left text-slate-300 hover:bg-slate-700/30 transition-colors rounded-lg"
                    >
                      <FileText className="w-5 h-5 text-orange-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{a.title}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">{selectedAssignment.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Submit Your Work</h3>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-green-400 font-semibold text-lg">Submitted successfully!</p>
                  <p className="text-slate-400 text-sm mt-2">{selectedFile?.name}</p>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-6 px-6 py-2 text-sm font-medium text-white bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:border-orange-500/50 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                    {selectedFile ? (
                      <p className="text-white font-medium">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-white font-semibold text-lg">Ready to submit?</p>
                        <p className="text-slate-400 text-sm mt-2">Drag and drop your file here or click to browse</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!selectedFile || submitting}
                      className="flex-1 py-3 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}