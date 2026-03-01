"use client";

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Trash2 } from "lucide-react";
import DashboardView from "@/components/shared/DashboardView";
import Dialog from "@/components/Dialog";
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

const daysOfWeek = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
];

const initialFormData = {
  courseName: "",
  courseAbbreviation: "",
  crn: "",
  courseDescription: "",
  semester: "",
  year: "",
  days: [],
  startTime: "",
  endTime: "",
};

const inputStyles = "w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200";
const labelStyles = "text-sm font-medium text-slate-300 block mb-2";

const CODE_CHARS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateUniqueCode(existingCodes) {
  let code;
  do {
    code = "";
    for (let i = 0; i < 7; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
  } while (existingCodes.includes(code));
  return code;
}

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { classes, setClasses } = useFacultyClasses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, crn: null, className: "" });
  const [formData, setFormData] = useState(initialFormData);

  
  useEffect(() => {
  if (!user?.id) return;
  fetch(`${API_BASE}/course/user/${user.id}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    })
    .then((data) => setClasses(Array.isArray(data) ? data.map((c) => ({ ...c, days: c.days ? c.days.split(",") : [] })) : []))
    .catch((err) => console.error("Error loading courses:", err));
}, [user]);

  const openDeleteConfirm = (classItem) => {
    setDeleteConfirm({ isOpen: true, crn: classItem.crn, className: classItem.courseName });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, crn: null, className: "" });
  };

  const handleDelete = async () => {
  try {
    const response = await fetch(`${API_BASE}/course/${deleteConfirm.crn}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete course");
    setClasses((prev) => prev.filter((c) => c.crn !== deleteConfirm.crn));
    closeDeleteConfirm();
  } catch (error) {
    console.error("Error deleting course:", error);
  }
  };

  const handleDayToggle = (dayId) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter((d) => d !== dayId)
        : [...prev.days, dayId],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const existingCodes = classes.map((c) => c.code).filter(Boolean);
  const code = generateUniqueCode(existingCodes);
  const newCourse = {
    ...formData,
    code,
    archived: false,
    days: formData.days.join(","),
  };
  try {
    const response = await fetch(`${API_BASE}/course/${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse),
    });
    if (!response.ok) throw new Error("Failed to create course");
    const savedCourse = await response.json();
    setClasses((prev) => [...prev, { ...savedCourse, days: savedCourse.days ? savedCourse.days.split(",") : [] }]);
    setIsDialogOpen(false);
    setFormData(initialFormData);
  } catch (error) {
    console.error("Error creating course:", error);
  }
};

  const activeClasses = classes.filter((c) => !c.archived);
  const dashboardContent =
    activeClasses.length === 0 ? (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">No classes yet. Click &quot;Add course&quot; to get started.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeClasses.map((classItem) => (
          <div
            key={classItem.crn}
            onClick={() => router.push(`/faculty/courses/${classItem.crn}`)}
            className="relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-200 cursor-pointer group"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteConfirm(classItem);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
                {classItem.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}
                {" · "}
                {classItem.startTime} - {classItem.endTime}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 space-y-1">
              <p className="text-slate-500 text-xs">
                {classItem.semester.charAt(0).toUpperCase() + classItem.semester.slice(1)} {classItem.year}
                {" · "}CRN: {classItem.crn}
              </p>
              <p className="text-xs font-medium text-teal-400">Class code: {classItem.code}</p>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <>
      <DashboardView
        title="Faculty Dashboard"
        showAddCourse
        variant="faculty"
        onAddCourseClick={() => setIsDialogOpen(true)}
      >
        {dashboardContent}
      </DashboardView>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Add Class">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="courseName" className={labelStyles}>Course Name</label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="e.g. Introduction to Computer Science"
              className={inputStyles}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="courseAbbreviation" className={labelStyles}>Course Abbreviation</label>
              <input
                type="text"
                id="courseAbbreviation"
                name="courseAbbreviation"
                value={formData.courseAbbreviation}
                onChange={handleChange}
                placeholder="e.g. CS101"
                className={inputStyles}
                required
              />
            </div>
            <div>
              <label htmlFor="crn" className={labelStyles}>CRN</label>
              <input
                type="text"
                id="crn"
                name="crn"
                value={formData.crn}
                onChange={handleChange}
                placeholder="e.g. 12345"
                className={inputStyles}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="semester" className={labelStyles}>Semester</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={inputStyles}
                required
              >
                <option value="">Select semester</option>
                <option value="fall">Fall</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
              </select>
            </div>
            <div>
              <label htmlFor="year" className={labelStyles}>Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g. 2026"
                className={inputStyles}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelStyles}>Days</label>
            <div className="flex gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleDayToggle(day.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    formData.days.includes(day.id)
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className={labelStyles}>Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className={labelStyles}>End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="courseDescription" className={labelStyles}>Course Description</label>
            <textarea
              id="courseDescription"
              name="courseDescription"
              value={formData.courseDescription}
              onChange={handleChange}
              placeholder="Brief description of the course..."
              rows={3}
              className={inputStyles}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors duration-200 shadow-lg shadow-teal-600/30"
            >
              Add Class
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog isOpen={deleteConfirm.isOpen} onClose={closeDeleteConfirm} title="Delete Class" size="sm">
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm.className}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeDeleteConfirm}
              className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
