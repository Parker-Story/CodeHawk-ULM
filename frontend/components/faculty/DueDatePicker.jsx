// Minor change to trigger commit so contribution appears under correct GitHub account

"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5";

const triggerClass =
  "w-full flex items-center justify-between gap-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-left text-zinc-900 dark:text-white " +
  "hover:border-zinc-400 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent transition-colors";

const inputRowClass =
  "w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-600 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600/40";

function parseLocalDatetime(s) {
  if (!s || typeof s !== "string") return null;
  const [datePart, timePart] = s.split("T");
  if (!datePart) return null;
  const [y, mo, d] = datePart.split("-").map(Number);
  if (!y || !mo || !d) return null;
  const [h, mi] = (timePart || "23:59").split(":").map(Number);
  return new Date(y, mo - 1, d, Number.isFinite(h) ? h : 23, Number.isFinite(mi) ? mi : 59, 0, 0);
}

function formatLocalDatetime(d) {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DueDatePicker({ value, onChange, id = "due-date", optionalLabel }) {
  const selected = parseLocalDatetime(value);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => parseLocalDatetime(value) || new Date());
  const wrapRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  const dateInputValue = selected ? format(selected, "yyyy-MM-dd") : "";
  const timeInputValue = selected
    ? `${String(selected.getHours()).padStart(2, "0")}:${String(selected.getMinutes()).padStart(2, "0")}`
    : "23:59";

  const handleOpenToggle = () => {
    if (!open) {
      setVisibleMonth(parseLocalDatetime(value) || new Date());
    }
    setOpen((o) => !o);
  };

  const mergeDateAndTime = (dateStr, timeStr) => {
    const dPart = dateStr || format(new Date(), "yyyy-MM-dd");
    const tPart = timeStr || "23:59";
    const [y, mo, d] = dPart.split("-").map(Number);
    const [h, mi] = tPart.split(":").map(Number);
    if (!y || !mo || !d) return "";
    const dt = new Date(y, mo - 1, d, Number.isFinite(h) ? h : 23, Number.isFinite(mi) ? mi : 59, 0, 0);
    return formatLocalDatetime(dt);
  };

  const handleManualDateChange = (e) => {
    const v = e.target.value;
    if (!v) {
      onChange("");
      return;
    }
    onChange(mergeDateAndTime(v, timeInputValue));
  };

  const handleManualTimeChange = (e) => {
    const v = e.target.value;
    if (!dateInputValue) {
      onChange(mergeDateAndTime(format(new Date(), "yyyy-MM-dd"), v));
      return;
    }
    onChange(mergeDateAndTime(dateInputValue, v));
  };

  const handleDayClick = (day) => {
    const next = new Date(day);
    if (selected) {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    } else 
    {
      next.setHours(23, 59, 0, 0);
    }
    onChange(formatLocalDatetime(next));
  };

  const displayLabel = selected
    ? format(selected, "MMM d, yyyy 'at' h:mm a")
    : "Choose date & time";

  return (
    <div className="relative" ref={wrapRef}>
      <label id={`${id}-label`} htmlFor={id} className={labelClass}>
        Due Date {optionalLabel}
      </label>
      <button
        type="button"
        id={id}
        className={triggerClass}
        onClick={handleOpenToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-4 h-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden />
          <span className={`truncate text-sm ${!selected ? "text-zinc-400 dark:text-zinc-500" : ""}`}>
            {displayLabel}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Due date"
          className="absolute z-50 mt-1.5 w-full min-w-[min(100%,18rem)] max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl shadow-black/10 dark:shadow-black/40 p-3"
        >
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Enter manually or pick below</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <label className="sr-only" htmlFor={`${id}-manual-date`}>
                Date
              </label>
              <input
                id={`${id}-manual-date`}
                type="date"
                value={dateInputValue}
                onChange={handleManualDateChange}
                className={inputRowClass}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="w-full sm:w-[7.5rem] shrink-0">
              <label className="sr-only" htmlFor={`${id}-manual-time`}>
                Time
              </label>
              <input
                id={`${id}-manual-time`}
                type="time"
                value={timeInputValue}
                onChange={handleManualTimeChange}
                className={inputRowClass}
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/50 overflow-hidden">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setVisibleMonth((d) => subMonths(d, 1))}
                className="p-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                {format(visibleMonth, "MMM yyyy")}
              </span>
              <button
                type="button"
                onClick={() => setVisibleMonth((d) => addMonths(d, 1))}
                className="p-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    className="text-center text-[9px] font-semibold uppercase text-zinc-500 py-0.5"
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {monthDays.map((day) => {
                  const inMonth = isSameMonth(day, visibleMonth);
                  const isSelected = selected && isSameDay(day, selected);
                  const today = isToday(day);
                  return (
                    <button
                      key={format(day, "yyyy-MM-dd")}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={[
                        "h-7 text-[11px] rounded-md transition-colors",
                        !inMonth && "text-zinc-400 dark:text-zinc-600",
                        inMonth && !isSelected && "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600",
                        isSelected && "text-white font-semibold",
                        today && !isSelected && "ring-1 ring-amber-500/50",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={isSelected ? { background: "#862633" } : undefined}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {value ? (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              >
                Clear due date
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}




