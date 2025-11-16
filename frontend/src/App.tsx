import { useState, useEffect } from "react";
import "./App.css";
import type { Todo, CreateTodoDto, UpdateTodoDto } from "./types/todo";
import { todoApi } from "./services/todoApi";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TodoDetail from "./components/TodoDetail";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApi.getAllTodos();
      setTodos(data);
    } catch (err) {
      setError("Failed to load todos. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (data: CreateTodoDto) => {
    try {
      setError(null);
      const newTodo = await todoApi.createTodo(data);
      setTodos([...todos, newTodo]);
    } catch (err) {
      setError("Failed to add todo. Please try again.");
      console.error(err);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      setError(null);
      const updatedTodo = await todoApi.toggleTodo(id);
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      setError("Failed to update todo. Please try again.");
      console.error(err);
    }
  };

  const handleUpdateTodo = async (id: string, data: UpdateTodoDto) => {
    try {
      setError(null);
      const updatedTodo = await todoApi.updateTodo(id, data);
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      setSelectedTodo(updatedTodo);
    } catch (err) {
      setError("Failed to update todo. Please try again.");
      console.error(err);
      throw err;
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setError(null);
      await todoApi.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      if (selectedTodo?.id === id) {
        setSelectedTodo(null);
      }
    } catch (err) {
      setError("Failed to delete todo. Please try again.");
      console.error(err);
    }
  };

  const handleViewDetails = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>✓ Todo App</h1>
          <div className="stats">
            <span className="stat-item">
              Total: <strong>{stats.total}</strong>
            </span>
            <span className="stat-item">
              Active: <strong>{stats.active}</strong>
            </span>
            <span className="stat-item">
              Done: <strong>{stats.completed}</strong>
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="todo-container">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
              <button onClick={() => setError(null)} className="dismiss-button">
                ×
              </button>
            </div>
          )}

          <TodoForm onAdd={handleAddTodo} disabled={loading} />

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              className={`filter-tab ${filter === "active" ? "active" : ""}`}
              onClick={() => setFilter("active")}
            >
              Active ({stats.active})
            </button>
            <button
              className={`filter-tab ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed ({stats.completed})
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading todos...</p>
            </div>
          ) : (
            <TodoList
              todos={filteredTodos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </main>

      {selectedTodo && (
        <TodoDetail
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
          onUpdate={handleUpdateTodo}
        />
      )}
    </div>
  );
}

export default App;
