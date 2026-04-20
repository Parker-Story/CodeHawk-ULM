"use client";

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown, Clock, Trash2 } from "lucide-react";
import DashboardView from "@/components/shared/DashboardView";
import Dialog from "@/components/Dialog";
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

const TIME_OPTIONS = (() => {
  const opts = [];
  for (let total = 7 * 60; total <= 24 * 60; total += 5) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 || h === 24 ? "AM" : "PM";
    const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
    opts.push({ value, label });
  }
  return opts;
})();

function TimeInput({ id, placeholder, onChange }) {
  const [inputVal, setInputVal] = useState("");
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(TIME_OPTIONS);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (typed) => {
    setInputVal(typed);
    setOpen(true);
    const q = typed.toLowerCase().replace(/\s/g, "");
    setFiltered(q ? TIME_OPTIONS.filter((t) => t.label.toLowerCase().replace(/\s/g, "").includes(q)) : TIME_OPTIONS);
    const exact = TIME_OPTIONS.find((t) => t.label.toLowerCase() === typed.toLowerCase());
    onChange(exact ? exact.value : "");
  };

  const handleSelect = (option) => {
    setInputVal(option.label);
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="text"
        value={inputVal}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={inputStyles + " pr-10"}
      />
      <button type="button" tabIndex={-1} onClick={() => setOpen((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
        <ChevronDown size={16} />
      </button>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg">
          {filtered.map((t) => (
            <li key={t.value} onMouseDown={() => handleSelect(t)} className="px-4 py-2 text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer">
              {t.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const daysOfWeek = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
];

const initialFormData = {
  courseName: "", courseAbbreviation: "", crn: "", courseDescription: "",
  semester: "", year: "", days: [], startTime: "", endTime: "",
};

const inputStyles = "w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent transition-all duration-200";
const labelStyles = "text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2";

const CODE_CHARS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 || h === 24 ? "AM" : "PM";
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function generateUniqueCode(existingCodes) {
  let code;
  do {
    code = "";
    for (let i = 0; i < 7; i++) { code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]; }
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
  const [courseError, setCourseError] = useState(null);
  const [timeResetKey, setTimeResetKey] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE}/course/user/${user.id}`)
        .then((res) => { if (!res.ok) throw new Error("Failed to fetch courses"); return res.json(); })
        .then((data) => setClasses(Array.isArray(data) ? data.map((c) => ({ ...c, days: c.days ? c.days.split(",") : [] })) : []))
        .catch((err) => console.error("Error loading courses:", err));
  }, [user]);

  const openDeleteConfirm = (classItem) => setDeleteConfirm({ isOpen: true, crn: classItem.crn, className: classItem.courseName });
  const closeDeleteConfirm = () => setDeleteConfirm({ isOpen: false, crn: null, className: "" });

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE}/course/${deleteConfirm.crn}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete course");
      setClasses((prev) => prev.filter((c) => c.crn !== deleteConfirm.crn));
      closeDeleteConfirm();
    } catch (error) { console.error("Error deleting course:", error); }
  };

  const handleDayToggle = (dayId) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(dayId) ? prev.days.filter((d) => d !== dayId) : [...prev.days, dayId],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCourseError(null);

    // Client-side validation
    if (!/^[A-Z]{4} \d{4}$/.test(formData.courseAbbreviation)) {
      setCourseError("Course abbreviation must be 4 capital letters, a space, then 4 digits (e.g. CSCI 4060).");
      return;
    }
    if (!/^\d{5}$/.test(formData.crn)) {
      setCourseError("CRN must be exactly 5 digits (e.g. 12345).");
      return;
    }
    const currentYear = new Date().getFullYear();
    if (!formData.year || formData.year < 2000 || formData.year > currentYear + 5) {
      setCourseError(`Year must be between 2000 and ${currentYear + 5}.`);
      return;
    }
    if (classes.some((c) => c.crn === formData.crn)) {
      setCourseError("A course with this CRN already exists.");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setCourseError("Please select a valid start and end time.");
      return;
    }
    if (formData.endTime <= formData.startTime) {
      setCourseError("End time must be after start time.");
      return;
    }
    const [sh, sm] = formData.startTime.split(":").map(Number);
    const [eh, em] = formData.endTime.split(":").map(Number);
    if ((eh * 60 + em) - (sh * 60 + sm) < 30) {
      setCourseError("Course duration must be at least 30 minutes.");
      return;
    }

    const toMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const newStart = toMinutes(formData.startTime);
    const newEnd = toMinutes(formData.endTime);
    const conflict = classes.find((c) => {
      if (c.archived) return false;
      if (c.semester !== formData.semester || String(c.year) !== String(formData.year)) return false;
      const sharedDay = (c.days || []).some((d) => formData.days.includes(d));
      if (!sharedDay) return false;
      const cStart = toMinutes(c.startTime);
      const cEnd = toMinutes(c.endTime);
      return newStart < cEnd && newEnd > cStart;
    });
    if (conflict) {
      setCourseError(`Time conflict with "${conflict.courseName}" (${conflict.startTime}–${conflict.endTime}). You cannot teach two courses at the same time.`);
      return;
    }

    const existingCodes = classes.map((c) => c.code).filter(Boolean);
    const code = generateUniqueCode(existingCodes);
    const newCourse = { ...formData, code, archived: false, days: formData.days.join(",") };
    try {
      const response = await fetch(`${API_BASE}/course/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });
      if (!response.ok) {
        const msg = response.status === 409
            ? "A course with this CRN already exists."
            : "Failed to create course.";
        setCourseError(msg);
        return;
      }
      const savedCourse = await response.json();
      setClasses((prev) => [...prev, { ...savedCourse, days: savedCourse.days ? savedCourse.days.split(",") : [] }]);
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setTimeResetKey((k) => k + 1);
      setCourseError(null);
    } catch (error) {
      console.error("Error creating course:", error);
      setCourseError("An unexpected error occurred.");
    }
  };

  const activeClasses = classes.filter((c) => !c.archived);

  const dashboardContent = activeClasses.length === 0 ? (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-400">No classes yet. Click &quot;Add course&quot; to get started.</p>
      </div>
  ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeClasses.map((classItem) => (
            <div
                key={classItem.crn}
                onClick={() => router.push(`/faculty/courses/${classItem.crn}`)}
                className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 hover:border-zinc-300 dark:hover:border-zinc-500 shadow-sm transition-all duration-200 cursor-pointer group"
            >
              <button
                  onClick={(e) => { e.stopPropagation(); openDeleteConfirm(classItem); }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#C9A84C1a" }}>
                  <BookOpen className="w-6 h-6" style={{ color: "#c0a080" }} />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">{classItem.courseName}</h3>
                  <p className="font-medium text-sm" style={{ color: "#C9A84C" }}>{classItem.courseAbbreviation}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2">{classItem.courseDescription || "No description provided."}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>
              {classItem.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}
                  {" · "}{formatTime(classItem.startTime)} – {formatTime(classItem.endTime)}
            </span>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  {classItem.semester.charAt(0).toUpperCase() + classItem.semester.slice(1)} {classItem.year}
                  {" · "}CRN: {classItem.crn}
                </p>
              </div>
            </div>
        ))}
      </div>
  );

  return (
      <>
        <DashboardView title="Faculty Dashboard" showAddCourse variant="faculty" onAddCourseClick={() => setIsDialogOpen(true)}>
          {dashboardContent}
        </DashboardView>

        <Dialog isOpen={isDialogOpen} onClose={() => { setIsDialogOpen(false); setCourseError(null); }} title="Add Class">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="courseName" className={labelStyles}>Course Name</label>
              <input type="text" id="courseName" name="courseName" value={formData.courseName} onChange={handleChange} placeholder="e.g. Introduction to Computer Science" className={inputStyles} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="courseAbbreviation" className={labelStyles}>Course Abbreviation</label>
                <input
                  type="text" id="courseAbbreviation" name="courseAbbreviation"
                  value={formData.courseAbbreviation}
                  onChange={(e) => {
                    const raw = e.target.value.toUpperCase();
                    const letters = raw.replace(/[^A-Z]/g, "").slice(0, 4);
                    const digits = raw.replace(/[^0-9]/g, "").slice(0, 4);
                    let formatted = letters;
                    if (letters.length === 4 && (raw.includes(" ") || raw.length > 4)) {
                      formatted = letters + " " + digits;
                    }
                    setFormData((p) => ({ ...p, courseAbbreviation: formatted }));
                  }}
                  placeholder="e.g. CSCI 4060" maxLength={9} className={inputStyles} required
                />
              </div>
              <div>
                <label htmlFor="crn" className={labelStyles}>CRN</label>
                <input type="text" id="crn" name="crn" value={formData.crn} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 5); setFormData((p) => ({ ...p, crn: v })); }} placeholder="e.g. 12345" maxLength={5} className={inputStyles} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="semester" className={labelStyles}>Semester</label>
                <select id="semester" name="semester" value={formData.semester} onChange={handleChange} className={inputStyles} required>
                  <option value="">Select semester</option>
                  <option value="fall">Fall</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                </select>
              </div>
              <div>
                <label htmlFor="year" className={labelStyles}>Year</label>
                <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2026" className={inputStyles} required />
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
                        className="px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200"
                        style={formData.days.includes(day.id)
                            ? { background: "#862633", borderColor: "#862633", color: "white" }
                            : { background: "transparent", borderColor: "#d4d4d8", color: "#71717a" }
                        }
                    >
                      {day.label}
                    </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className={labelStyles}>Start Time</label>
                <TimeInput key={`start-${timeResetKey}`} id="startTime" placeholder="e.g. 8:00 AM" onChange={(v) => setFormData((p) => ({ ...p, startTime: v }))} />
              </div>
              <div>
                <label htmlFor="endTime" className={labelStyles}>End Time</label>
                <TimeInput key={`end-${timeResetKey}`} id="endTime" placeholder="e.g. 9:15 AM" onChange={(v) => setFormData((p) => ({ ...p, endTime: v }))} />
              </div>
            </div>
            <div>
              <label htmlFor="courseDescription" className={labelStyles}>Course Description</label>
              <textarea id="courseDescription" name="courseDescription" value={formData.courseDescription} onChange={handleChange} placeholder="Brief description of the course..." rows={3} className={inputStyles} />
            </div>
            {courseError && (
                <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                  <p className="text-red-400 text-sm">{courseError}</p>
                </div>
            )}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsDialogOpen(false)} className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors duration-200">Cancel</button>
              <button type="submit" className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors duration-200" style={{ background: "#862633" }}>Add Class</button>
            </div>
          </form>
        </Dialog>

        <Dialog isOpen={deleteConfirm.isOpen} onClose={closeDeleteConfirm} title="Delete Class" size="sm">
          <div className="space-y-4">
            <p className="text-zinc-300">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm.className}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeDeleteConfirm} className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors duration-200">Cancel</button>
              <button type="button" onClick={handleDelete} className="flex-1 py-3 text-sm font-medium text-white bg-red-800 rounded-xl hover:bg-red-700 transition-colors duration-200">Delete</button>
            </div>
          </div>
        </Dialog>
      </>
  );
}