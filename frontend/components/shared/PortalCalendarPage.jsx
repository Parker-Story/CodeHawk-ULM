"use client";

import CalendarView from "@/components/shared/CalendarView";
import { PORTAL_CONFIG, eventsFromConfig } from "@/lib/portals";

/**
 * Shared calendar page: uses config for title and events per variant.
 * Pass events to override config defaults.
 */
export default function PortalCalendarPage({ variant, events: eventsOverride }) {
  const config = PORTAL_CONFIG[variant];
  if (!config?.calendar) return null;
  const { title } = config.calendar;
  const events = eventsOverride ?? eventsFromConfig(config.calendar.events);
  return <CalendarView title={title} events={events} variant={variant} />;
}
