"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, Navigate } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function MinimalToolbar({ label, onNavigate }) {
  return (
    <div className="flex justify-between items-center bg-slate-700 text-white px-4 py-3 border-b border-slate-600">
      <span className="text-lg font-semibold">{label}</span>
      <span className="flex gap-1">
        <button
          type="button"
          onClick={() => onNavigate(Navigate.PREVIOUS)}
          className="text-white hover:bg-slate-600 rounded px-2 py-1 transition-colors"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => onNavigate(Navigate.NEXT)}
          className="text-white hover:bg-slate-600 rounded px-2 py-1 transition-colors"
        >
          ›
        </button>
      </span>
    </div>
  );
}

const baseCalendarClass =
  "min-h-[70vh] rounded-lg overflow-hidden bg-slate-800 border border-slate-700 " +
  "[&_.rbc-month-view]:bg-slate-100 " +
  "[&_.rbc-header]:bg-slate-700 [&_.rbc-header]:text-white [&_.rbc-header]:border-slate-600 " +
  "[&_.rbc-date-cell]:text-slate-800 [&_.rbc-date-cell_a]:text-slate-800 " +
  "[&_.rbc-off-range]:text-slate-400 [&_.rbc-off-range_a]:text-slate-400 ";
const calendarVariantClass = (variant) =>
  variant === "faculty"
    ? "[&_.rbc-today]:bg-teal-100 [&_.rbc-event]:bg-teal-600 [&_.rbc-event]:text-white [&_.rbc-event]:border-teal-500"
    : variant === "ta"
      ? "[&_.rbc-today]:bg-violet-100 [&_.rbc-event]:bg-violet-600 [&_.rbc-event]:text-white [&_.rbc-event]:border-violet-500"
      : "[&_.rbc-today]:bg-orange-100 [&_.rbc-event]:bg-orange-600 [&_.rbc-event]:text-white [&_.rbc-event]:border-orange-500";

/**
 * Shared calendar view for students and faculty.
 * variant: "student" (orange) | "faculty" (teal)
 */
export default function CalendarView({ title = "Calendar", events = [], variant = "student" }) {
  const [date, setDate] = useState(new Date());

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{title}</h1>
        <div className={baseCalendarClass + calendarVariantClass(variant)}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={date}
            onNavigate={setDate}
            view="month"
            views={["month"]}
            components={{ toolbar: MinimalToolbar }}
            style={{ height: "100%", minHeight: "70vh" }}
          />
        </div>
      </div>
    </div>
  );
}
