import { Request, Response, NextFunction } from "express";
import { todoService } from "../services/TodoService";
import { CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { AuthRequest } from "../middleware/authenticate";

export const getAllTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const todos = await todoService.getAllTodos(userId);
    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

export const getTodoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const todo = await todoService.getTodoById(req.params.id, userId);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const data: CreateTodoDto = req.body;
    try {
      const todo = await todoService.createTodo(data, userId);
      res.status(201).json(todo);
    } catch (err: any) {
      if (err.message === "Title is required") {
        res.status(400).json({ message: err.message });
      } else if (err.message === "A todo with this title already exists") {
        res.status(409).json({ message: err.message });
      } else {
        throw err;
      }
    }
  } catch (error) {
    next(error);
  }
};

export const updateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const data: UpdateTodoDto = req.body;
    const todo = await todoService.updateTodo(req.params.id, userId, data);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

export const toggleTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const todo = await todoService.toggleTodo(req.params.id, userId);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const deleted = await todoService.deleteTodo(req.params.id, userId);
    if (!deleted) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
