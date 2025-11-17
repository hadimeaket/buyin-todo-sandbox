// Date utility functions for calendar

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatWeekRange(startDate: Date): string {
  const endDate = endOfWeek(startDate);
  const sameMonth = isSameMonth(startDate, endDate);

  if (sameMonth) {
    return `${startDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })} – ${endDate.getDate()}, ${endDate.getFullYear()}`;
  }

  return `${startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}, ${endDate.getFullYear()}`;
}

export function formatDayFull(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Build a 6x7 matrix of dates for month view (including overflow from prev/next months)
export function buildMonthMatrix(date: Date): Date[][] {
  const firstDay = startOfMonth(date);

  // Start from Monday of the week containing the first day
  const startDate = startOfWeek(firstDay);

  const matrix: Date[][] = [];
  let currentDate = new Date(startDate);

  // Always show 6 weeks
  for (let week = 0; week < 6; week++) {
    const weekDays: Date[] = [];
    for (let day = 0; day < 7; day++) {
      weekDays.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    matrix.push(weekDays);
  }

  return matrix;
}

// Build array of 7 dates for week view
export function buildWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }

  return days;
}

// Generate time slots for day/week view (24 hours)
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

// Parse time from ISO string or HH:MM format
export function parseTime(
  timeStr?: string
): { hour: number; minute: number } | null {
  if (!timeStr) return null;

  try {
    // Try ISO format first
    if (timeStr.includes("T")) {
      const date = new Date(timeStr);
      return { hour: date.getHours(), minute: date.getMinutes() };
    }

    // Try HH:MM format
    const [hour, minute] = timeStr.split(":").map(Number);
    if (!isNaN(hour) && !isNaN(minute)) {
      return { hour, minute };
    }
  } catch (e) {
    console.error("Failed to parse time:", timeStr, e);
  }

  return null;
}

// Calculate top position in pixels for time-based views
export function calculateTimePosition(
  time: { hour: number; minute: number },
  hourHeight: number = 60
): number {
  return time.hour * hourHeight + (time.minute / 60) * hourHeight;
}

// Get all todos for a specific date
export function getTodosForDate<
  T extends { dueDate?: string; dueEndDate?: string }
>(todos: T[], date: Date): T[] {
  return todos.filter((todo) => {
    if (!todo.dueDate) return false;
    const todoStartDate = new Date(todo.dueDate);

    // If there's an end date, check if the date is within the range
    if (todo.dueEndDate && todo.dueEndDate !== todo.dueDate) {
      const todoEndDate = new Date(todo.dueEndDate);
      const checkDate = startOfDay(date);
      const rangeStart = startOfDay(todoStartDate);
      const rangeEnd = startOfDay(todoEndDate);

      // Check if date is within the range (inclusive)
      return checkDate >= rangeStart && checkDate <= rangeEnd;
    }

    // Single day task - exact match
    return isSameDay(todoStartDate, date);
  });
}

// Expand recurring todos to show all occurrences within a date range
export function expandRecurringTodos<
  T extends {
    dueDate?: string;
    dueEndDate?: string;
    recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  }
>(todos: T[], startDate: Date, endDate: Date): T[] {
  const expanded: T[] = [];

  todos.forEach((todo) => {
    if (!todo.dueDate || !todo.recurrence || todo.recurrence === "none") {
      // Non-recurring or no due date - just add as is
      expanded.push(todo);
      return;
    }

    const originalDate = new Date(todo.dueDate);
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // Find first occurrence on or after start date
    let currentDate = new Date(originalDate);

    // If original date is after our range, skip
    if (currentDate > end) {
      return;
    }

    // Move to first occurrence within range
    while (currentDate < start) {
      currentDate = getNextOccurrence(currentDate, todo.recurrence);
    }

    // Generate all occurrences within range
    let occurrenceCount = 0;
    const maxOccurrences = 1000; // Safety limit

    while (currentDate <= end && occurrenceCount < maxOccurrences) {
      // Create a copy with updated due date
      const occurrence = {
        ...todo,
        dueDate: currentDate.toISOString(),
      };
      expanded.push(occurrence);

      // Move to next occurrence
      currentDate = getNextOccurrence(currentDate, todo.recurrence);
      occurrenceCount++;
    }
  });

  return expanded;
}

// Get the next occurrence date based on recurrence type
function getNextOccurrence(
  date: Date,
  recurrence: "daily" | "weekly" | "monthly" | "yearly"
): Date {
  const next = new Date(date);

  switch (recurrence) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}
