"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/shared/CalendarView";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

export default function TACalendarPage() {
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);
  const [events, setEvents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API_BASE}/courseUser/user/${user.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(async (courseUsers) => {
        const enrollments = (Array.isArray(courseUsers) ? courseUsers : []).filter(
          (cu) => !cu.course?.archived
        );

        const allEvents = [];
        await Promise.all(
          enrollments.map(async (cu) => {
            const res = await fetch(`${API_BASE}/assignment/course/${cu.course.crn}`, {
              cache: "no-store",
            });
            const assignments = await res.json();
            (Array.isArray(assignments) ? assignments : []).forEach((a) => {
              if (a.dueDate) {
                allEvents.push({
                  title: `${a.title} — ${cu.course.courseAbbreviation}`,
                  start: new Date(a.dueDate),
                  end: new Date(a.dueDate),
                  assignmentId: a.id,
                  courseId: cu.course.crn,
                });
              }
            });
          })
        );

        setEvents(allEvents);
      })
      .catch((err) => console.error(err));
  }, [user?.id]);

  const handleAssignmentClick = useCallback(async (event) => {
    try {
      const userId = userRef.current?.id;
      if (!userId) return;
      const courseUsers = await fetch(`${API_BASE}/courseUser/user/${userId}`, { cache: "no-store" }).then((r) => r.json());
      const enrollment = (Array.isArray(courseUsers) ? courseUsers : []).find(
        (cu) => String(cu.course?.crn) === String(event.courseId)
      );
      if (enrollment?.courseRole === "TA" || enrollment?.courseRole === "FACULTY") {
        router.push(`/ta/courses/${event.courseId}/assignments/${event.assignmentId}`);
      } else {
        router.push(`/students/courses/${event.courseId}?open=${event.assignmentId}`);
      }
    } catch (err) {
      console.error("Failed to determine role for assignment navigation:", err);
    }
  }, [router]);

  return (
    <CalendarView
      title="Calendar"
      events={events}
      onSelectEvent={handleAssignmentClick}
    />
  );
}
