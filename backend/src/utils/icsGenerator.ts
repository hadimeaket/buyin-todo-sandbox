import type { Todo } from "../models/Todo";

/**
 * Generates an ICS (iCalendar) file content from todos
 */
export function generateICSContent(todos: Todo[]): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Todo App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n");

  todos.forEach((todo) => {
    if (!todo.dueDate) return;

    const uid = `${todo.id}@todoapp.local`;
    const summary = todo.title.replace(/\n/g, "\\n");
    const description = (todo.description || "")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,");

    // Parse dueDate and startTime
    const dueDate = new Date(todo.dueDate);
    const startTimeStr = todo.startTime || "09:00";
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);

    const dtStart = new Date(dueDate);
    dtStart.setHours(startHour, startMinute, 0, 0);

    // Parse dueEndDate and endTime, or default to 1 hour after start
    let dtEnd: Date;
    if (todo.dueEndDate) {
      dtEnd = new Date(todo.dueEndDate);
      const endTimeStr = todo.endTime || "10:00";
      const [endHour, endMinute] = endTimeStr.split(":").map(Number);
      dtEnd.setHours(endHour, endMinute, 0, 0);
    } else {
      dtEnd = new Date(dtStart);
      dtEnd.setHours(dtStart.getHours() + 1);
    }

    // Format dates in iCalendar format (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (date: Date): string => {
      return date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    };

    const dtStartStr = formatICSDate(dtStart);
    const dtEndStr = formatICSDate(dtEnd);

    icsContent +=
      "\r\n" +
      [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${dtStartStr}`,
        `DTEND:${dtEndStr}`,
        `SUMMARY:${summary}`,
        description ? `DESCRIPTION:${description}` : "",
        `STATUS:${todo.completed ? "COMPLETED" : "NEEDS-ACTION"}`,
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
  });

  icsContent += "\r\n" + "END:VCALENDAR";
  return icsContent;
}

/**
 * Generates the ICS filename with current date
 */
export function generateICSFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `todos-${year}-${month}-${day}.ics`;
}
