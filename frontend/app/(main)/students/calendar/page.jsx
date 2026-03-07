"use client";

import { eventsFromConfig, PORTAL_CONFIG } from "@/lib/portals";
import CalendarView from "@/components/shared/CalendarView";

export default function PortalCalendarPage({ variant = "student" }) {
  const config = PORTAL_CONFIG[variant];
  const events = eventsFromConfig(config?.calendar?.events);
  const title = config?.calendar?.title ?? "Calendar";

  return <CalendarView title={title} events={events} />;
}