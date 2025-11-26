import { Request, Response, NextFunction } from "express";
import { todoService } from "../services/TodoService";
import { CreateTodoDto, UpdateTodoDto } from "../models/Todo";

export const getAllTodos = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const todos = await todoService.getAllTodos();
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
    const todo = await todoService.getTodoById(req.params.id);
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
    try {
      const todo = await todoService.createTodo(data);
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
    const data: UpdateTodoDto = req.body;
    const todo = await todoService.updateTodo(req.params.id, data);
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
    const todo = await todoService.toggleTodo(req.params.id);
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
    const deleted = await todoService.deleteTodo(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const generateTestTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = parseInt(req.query.count as string) || 1000;
    const todos = [];
    
    for (let i = 1; i <= count; i++) {
      const todo = await todoService.createTodo({
        title: `T${i}`,
      });
      todos.push(todo);
    }
    
    res.json({ message: `Generated ${count} todos`, count: todos.length });
  } catch (error) {
    next(error);
  }
};

export const assignCategoryToAllTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryName } = req.body;
    const { categoryRepository } = await import("../repositories/CategoryRepository");
    const { todoRepository } = await import("../repositories/TodoRepository");
    
    // Find category by name
    const category = await categoryRepository.findByName(categoryName || "Gym");
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Get all todos
    const todos = await todoRepository.findAll();
    
    // Update all todos with the category
    let updatedCount = 0;
    for (const todo of todos) {
      await todoRepository.update(todo.id, { categoryId: category.id });
      updatedCount++;
    }

    res.json({ 
      message: `Assigned category "${category.name}" to ${updatedCount} todos`,
      categoryId: category.id,
      updatedCount 
    });
  } catch (error) {
    next(error);
  }
};
