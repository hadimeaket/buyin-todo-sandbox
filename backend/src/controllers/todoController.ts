import { Response, NextFunction } from "express";
import { todoService } from "../services/TodoService";
import { CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { AuthRequest } from "../middleware/auth";

export const getAllTodos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const todos = await todoService.getAllTodos(req.userId!);
    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

export const getTodoById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const todo = await todoService.getTodoById(req.params.id, req.userId!);
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateTodoDto = req.body;
    try {
      const todo = await todoService.createTodo(data, req.userId!);
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: UpdateTodoDto = req.body;
    const todo = await todoService.updateTodo(req.params.id, data, req.userId!);
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const todo = await todoService.toggleTodo(req.params.id, req.userId!);
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await todoService.deleteTodo(req.params.id, req.userId!);
    if (!deleted) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
