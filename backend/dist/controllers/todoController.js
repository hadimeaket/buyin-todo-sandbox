"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.toggleTodo = exports.updateTodo = exports.createTodo = exports.getTodoById = exports.getAllTodos = void 0;
const TodoService_1 = require("../services/TodoService");
const getAllTodos = async (req, res, next) => {
    try {
        const todos = await TodoService_1.todoService.getAllTodos(req.userId);
        res.status(200).json(todos);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllTodos = getAllTodos;
const getTodoById = async (req, res, next) => {
    try {
        const todo = await TodoService_1.todoService.getTodoById(req.params.id, req.userId);
        if (!todo) {
            res.status(404).json({ message: "Todo not found" });
            return;
        }
        res.status(200).json(todo);
    }
    catch (error) {
        next(error);
    }
};
exports.getTodoById = getTodoById;
const createTodo = async (req, res, next) => {
    try {
        const data = req.body;
        try {
            const todo = await TodoService_1.todoService.createTodo(data, req.userId);
            res.status(201).json(todo);
        }
        catch (err) {
            if (err.message === "Title is required") {
                res.status(400).json({ message: err.message });
            }
            else if (err.message === "A todo with this title already exists") {
                res.status(409).json({ message: err.message });
            }
            else {
                throw err;
            }
        }
    }
    catch (error) {
        next(error);
    }
};
exports.createTodo = createTodo;
const updateTodo = async (req, res, next) => {
    try {
        const data = req.body;
        const todo = await TodoService_1.todoService.updateTodo(req.params.id, data, req.userId);
        if (!todo) {
            res.status(404).json({ message: "Todo not found" });
            return;
        }
        res.status(200).json(todo);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTodo = updateTodo;
const toggleTodo = async (req, res, next) => {
    try {
        const todo = await TodoService_1.todoService.toggleTodo(req.params.id, req.userId);
        if (!todo) {
            res.status(404).json({ message: "Todo not found" });
            return;
        }
        res.status(200).json(todo);
    }
    catch (error) {
        next(error);
    }
};
exports.toggleTodo = toggleTodo;
const deleteTodo = async (req, res, next) => {
    try {
        const deleted = await TodoService_1.todoService.deleteTodo(req.params.id, req.userId);
        if (!deleted) {
            res.status(404).json({ message: "Todo not found" });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTodo = deleteTodo;
//# sourceMappingURL=todoController.js.map