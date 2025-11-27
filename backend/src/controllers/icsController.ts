import { Request, Response, NextFunction } from "express";
import { TodoService } from "../services/TodoService";
import { generateICSContent, generateICSFilename } from "../utils/icsGenerator";

const todoService = new TodoService();

export const exportICS = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get all todos for the user
    const todos = await todoService.getAllTodos(userId);

    // Generate ICS content
    const icsContent = generateICSContent(todos);
    const filename = generateICSFilename();

    // Set headers for file download
    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.status(200).send(icsContent);
  } catch (error) {
    next(error);
  }
};
