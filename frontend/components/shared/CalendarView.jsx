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
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function MinimalToolbar({ label, onNavigate }) {
  return (
      <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-3 border-b border-zinc-200 dark:border-zinc-600">
        <span className="text-lg font-semibold">{label}</span>
        <span className="flex gap-1">
        <button type="button" onClick={() => onNavigate(Navigate.PREVIOUS)} className="hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded px-2 py-1 transition-colors">‹</button>
        <button type="button" onClick={() => onNavigate(Navigate.NEXT)} className="hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded px-2 py-1 transition-colors">›</button>
      </span>
      </div>
  );
}

const calendarClass =
    "min-h-[70vh] rounded-lg overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 " +
    "[&_.rbc-month-view]:bg-white dark:[&_.rbc-month-view]:bg-zinc-100 " +
    "[&_.rbc-header]:bg-zinc-100 dark:[&_.rbc-header]:bg-zinc-700 [&_.rbc-header]:text-zinc-700 dark:[&_.rbc-header]:text-white [&_.rbc-header]:border-zinc-200 dark:[&_.rbc-header]:border-zinc-600 " +
    "[&_.rbc-date-cell]:text-zinc-700 [&_.rbc-date-cell_a]:text-zinc-700 " +
    "[&_.rbc-off-range]:text-zinc-400 [&_.rbc-off-range_a]:text-zinc-400 " +
    "[&_.rbc-today]:bg-amber-100 [&_.rbc-event]:text-white [&_.rbc-event]:border-0 [&_.rbc-event]:rounded";

export default function CalendarView({ title = "Calendar", events = [] }) {
  const [date, setDate] = useState(new Date());

  return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">{title}</h1>
          <div className={calendarClass}>
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
                eventPropGetter={() => ({ style: { backgroundColor: "#862633", border: "none" } })}
                style={{ height: "100%", minHeight: "70vh" }}
            />
          </div>
        </div>
      </div>
  );
}