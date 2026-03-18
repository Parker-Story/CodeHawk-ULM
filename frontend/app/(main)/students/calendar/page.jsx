"use client";

import { useEffect, useState } from "react";
import CalendarView from "@/components/shared/CalendarView";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentCalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE}/courseUser/user/${user.id}`)
        .then((res) => res.json())
        .then(async (courseUsers) => {
          const allEvents = [];
          await Promise.all((Array.isArray(courseUsers) ? courseUsers : []).filter(cu => !cu.course?.archived).map(async (cu) => {
            const res = await fetch(`${API_BASE}/assignment/course/${cu.course.crn}`);
            const assignments = await res.json();
            (Array.isArray(assignments) ? assignments : []).forEach((a) => {
              if (a.dueDate) {
                const due = new Date(a.dueDate);
                allEvents.push({
                  title: `${a.title} — ${cu.course.courseAbbreviation}`,
                  start: due,
                  end: due,
                });
              }
            });
          }));
          setEvents(allEvents);
        })
        .catch((err) => console.error(err));
  }, [user?.id]);

  return <CalendarView title="Calendar" events={events} />;
}