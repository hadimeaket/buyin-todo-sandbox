import { Request, Response, NextFunction } from "express";
import { todoRepository } from "../repositories/TodoRepository";
import { CreateTodoDto, UpdateTodoDto } from "../models/Todo";

export const getAllTodos = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const todos = await todoRepository.findAll();
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
    const todo = await todoRepository.findById(req.params.id);
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
    const data: CreateTodoDto = req.body;
    if (!data.title || data.title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    // Check for duplicate
    const duplicate = await todoRepository.findDuplicate(
      data.title,
      data.description
    );
    if (duplicate) {
      res.status(409).json({
        message: "A todo with this title already exists",
        existingTodo: duplicate,
      });
      return;
    }

    const todo = await todoRepository.create(data);
    res.status(201).json(todo);
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
    const data: UpdateTodoDto = req.body;
    const todo = await todoRepository.update(req.params.id, data);
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
    const todo = await todoRepository.toggle(req.params.id);
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
    const deleted = await todoRepository.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
