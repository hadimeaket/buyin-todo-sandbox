import { Request, Response, NextFunction } from "express";
import ical, { ICalCalendarMethod, ICalEventStatus } from "ical-generator";
import { todoRepository } from "../repositories/TodoRepository";
import { categoryRepository } from "../repositories/CategoryRepository";

export const exportTodosAsICS = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get all todos
    const todos = await todoRepository.findAll();

    // Create calendar
    const calendar = ical({
      name: "Todo List",
      prodId: "//BuyIn Todo App//EN",
      method: ICalCalendarMethod.PUBLISH,
      timezone: "UTC",
    });

    // Add each todo as an event
    for (const todo of todos) {
      // Skip todos without due date
      if (!todo.dueDate) continue;

      const startDate = new Date(todo.dueDate);

      // Handle end date
      let endDate: Date;
      if (todo.dueEndDate) {
        endDate = new Date(todo.dueEndDate);
      } else if (todo.isAllDay) {
        // For all-day events, end date is start date + 1 day
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      } else {
        // For timed events, default to 1 hour duration
        endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);
      }

      // Get category name if exists
      let categoryName: string | undefined;
      if (todo.categoryId) {
        const category = await categoryRepository.findById(todo.categoryId);
        if (category) {
          categoryName = category.name;
        }
      }

      // Create event
      const event = calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: todo.title,
        description: todo.description || "",
        allDay: todo.isAllDay || false,
        status: todo.completed
          ? ICalEventStatus.CONFIRMED
          : ICalEventStatus.TENTATIVE,
      });

      // Add category if exists
      if (categoryName) {
        event.categories([{ name: categoryName }]);
      }

      // Add custom properties
      if (todo.priority) {
        event.priority(
          todo.priority === "high" ? 1 : todo.priority === "medium" ? 5 : 9
        );
      }

      // Add completion status
      if (todo.completed) {
        event.status(ICalEventStatus.CONFIRMED);
        event.x([
          {
            key: "X-MICROSOFT-CDO-BUSYSTATUS",
            value: "FREE",
          },
        ]);
      } else {
        event.status(ICalEventStatus.TENTATIVE);
      }
    }

    // Generate filename with current date
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const filename = `todos-${dateStr}.ics`;

    // Set response headers
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Send ICS file
    res.status(200).send(calendar.toString());
  } catch (error) {
    console.error("[exportTodosAsICS] Error:", error);
    next(error);
  }
};
