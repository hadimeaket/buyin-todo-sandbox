import { describe, it, expect } from "@jest/globals";
import {
  generateICSContent,
  generateICSFilename,
} from "../src/utils/icsGenerator";
import type { Todo } from "../src/models/Todo";

describe("TASK8_ICS_EXPORT", () => {
  it("generates an ICS file with DTSTART/DTEND populated from todo due dates", () => {
    const testTodos: Todo[] = [
      {
        id: "test-1",
        userId: "user-1",
        title: "Test Todo",
        description: "Test description",
        completed: false,
        dueDate: "2025-12-01",
        startTime: "09:00",
        dueEndDate: "2025-12-01",
        endTime: "10:00",
        createdAt: "2025-11-27T10:00:00.000Z",
        updatedAt: "2025-11-27T10:00:00.000Z",
      },
    ];

    const icsContent = generateICSContent(testTodos);

    expect(icsContent).toContain("BEGIN:VCALENDAR");
    expect(icsContent).toContain("END:VCALENDAR");
    expect(icsContent).toContain("BEGIN:VEVENT");
    expect(icsContent).toContain("END:VEVENT");
    expect(icsContent).toContain("DTSTART:");
    expect(icsContent).toContain("DTEND:");
    expect(icsContent).toContain("SUMMARY:Test Todo");
  });

  it("names the file todos-YYYY-MM-DD.ics and serves it with text/calendar", () => {
    const filename = generateICSFilename();

    // Check format: todos-YYYY-MM-DD.ics
    expect(filename).toMatch(/^todos-\d{4}-\d{2}-\d{2}\.ics$/);

    // Verify today's date is used
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const expectedFilename = `todos-${year}-${month}-${day}.ics`;

    expect(filename).toBe(expectedFilename);
  });
});
