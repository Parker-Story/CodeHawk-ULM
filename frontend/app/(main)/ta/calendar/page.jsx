"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/shared/CalendarView";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

export default function TACalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      fetch(`${API_BASE}/course/user/${user.id}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_BASE}/courseUser/user/${user.id}`, { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(async ([taCourses, courseUsers]) => {
        const allEvents = [];

        const taCoursesFiltered = (Array.isArray(taCourses) ? taCourses : []).filter(
          (c) => !c.archived
        );

        const seenCrns = new Set(taCoursesFiltered.map((c) => c.crn));

        const studentCourses = (Array.isArray(courseUsers) ? courseUsers : [])
          .filter((cu) => !cu.course?.archived && !seenCrns.has(cu.course?.crn))
          .map((cu) => cu.course);

        // Build events for TA courses first, then student courses.
        // Each event carries its own `isTA` flag so routing never depends on
        // external ref or closure state — the decision is embedded in the data.
        await Promise.all([
          ...taCoursesFiltered.map(async (course) => {
            const res = await fetch(`${API_BASE}/assignment/course/${course.crn}`, {
              cache: "no-store",
            });
            const assignments = await res.json();
            (Array.isArray(assignments) ? assignments : []).forEach((a) => {
              if (a.dueDate) {
                allEvents.push({
                  title: `${a.title} — ${course.courseAbbreviation}`,
                  start: new Date(a.dueDate),
                  end: new Date(a.dueDate),
                  assignmentId: a.id,
                  courseId: course.crn,
                  isTA: true,
                });
              }
            });
          }),
          ...studentCourses.map(async (course) => {
            const res = await fetch(`${API_BASE}/assignment/course/${course.crn}`, {
              cache: "no-store",
            });
            const assignments = await res.json();
            (Array.isArray(assignments) ? assignments : []).forEach((a) => {
              if (a.dueDate) {
                allEvents.push({
                  title: `${a.title} — ${course.courseAbbreviation}`,
                  start: new Date(a.dueDate),
                  end: new Date(a.dueDate),
                  assignmentId: a.id,
                  courseId: course.crn,
                  isTA: false,
                });
              }
            });
          }),
        ]);

        setEvents(allEvents);
      })
      .catch((err) => console.error(err));
  }, [user?.id]);

  function handleAssignmentClick(event) {
    if (event.isTA) {
      router.push(`/ta/courses/${event.courseId}/assignments/${event.assignmentId}`);
    } else {
      router.push(`/students/courses/${event.courseId}?open=${event.assignmentId}`);
    }
  }

  return (
    <CalendarView
      title="Calendar"
      events={events}
      onSelectEvent={handleAssignmentClick}
    />
  );
}
