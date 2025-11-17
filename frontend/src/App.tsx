// src/App.tsx
import { useState, useEffect } from "react";
import "./styles/App.scss";
import type { Todo, CreateTodoDto, UpdateTodoDto } from "./types/todo";
import { todoApi } from "./services/todoApi";
import Header from "./components/Header";
import TodoForm from "./components/TodoForm";
import Tabs from "./components/Tabs";
import TodoList from "./components/TodoList";
import TodoDetail from "./components/TodoDetail";
import CalendarView from "./components/CalendarView";
import SearchInput from "./components/ui/SearchInput";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
      console.error(err);
      setError("Failed to load todos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (data: CreateTodoDto) => {
    try {
      setError(null);
      const newTodo = await todoApi.createTodo(data);
      setTodos((prev) => [...prev, newTodo]);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === "object" && "response" in err) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 409) {
          setError(
            "A todo with this title already exists. Please use a different title."
          );
        } else {
          setError("Failed to add todo. Please try again.");
        }
      } else {
        setError("Failed to add todo. Please try again.");
      }
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      setError(null);
      const updatedTodo = await todoApi.toggleTodo(id);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update todo. Please try again.");
    }
  };

  const handleUpdateTodo = async (id: string, data: UpdateTodoDto) => {
    try {
      setError(null);
      const updatedTodo = await todoApi.updateTodo(id, data);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      setSelectedTodo(updatedTodo);
    } catch (err) {
      console.error(err);
      setError("Failed to update todo. Please try again.");
      throw err;
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setError(null);
      await todoApi.deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      setSelectedTodo((current) => (current?.id === id ? null : current));
    } catch (err) {
      console.error(err);
      setError("Failed to delete todo. Please try again.");
    }
  };

  const handleViewDetails = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  const filteredTodos = todos
    .filter((todo) => {
      // Filter by completion status
      if (filter === "active" && todo.completed) return false;
      if (filter === "completed" && !todo.completed) return false;

      // Filter by search query (search in title and description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDescription =
          todo.description?.toLowerCase().includes(query) || false;
        return matchesTitle || matchesDescription;
      }

      return true;
    })
    .sort((a, b) => {
      // Todos without due dates go to the end
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      // Sort by due date - most recent upcoming first
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    });

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  const tabsData = [
    { id: "all", label: "All", count: stats.total },
    { id: "active", label: "Active", count: stats.active },
    { id: "completed", label: "Completed", count: stats.completed },
  ];

  return (
    <div className="app">
      <div className="app__container">
        <Header
          totalCount={stats.total}
          activeCount={stats.active}
          completedCount={stats.completed}
        />

        <main className="app__main-card">
          {error && (
            <div className="error-alert">
              <svg
                className="error-alert__icon"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="error-alert__message">{error}</div>
              <button
                onClick={() => setError(null)}
                className="error-alert__close"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <section className="section section--bordered">
            <TodoForm onAdd={handleAddTodo} disabled={loading} />
          </section>

          <section className="section section--search section--bordered">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks..."
              disabled={loading}
            />
          </section>

          <section className="section section--tabs section--bordered">
            <Tabs
              tabs={tabsData}
              activeTab={filter}
              onTabChange={(tabId) =>
                setFilter(tabId as "all" | "active" | "completed")
              }
            />
          </section>

          {/* View Mode Segmented Control */}
          <section className="section section--view-toggle section--bordered">
            <div className="view-toggle">
              <button
                className={`view-toggle__button ${
                  viewMode === "list" ? "view-toggle__button--active" : ""
                }`}
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                List View
              </button>
              <button
                className={`view-toggle__button ${
                  viewMode === "calendar" ? "view-toggle__button--active" : ""
                }`}
                onClick={() => setViewMode("calendar")}
                aria-pressed={viewMode === "calendar"}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Calendar View
              </button>
            </div>
          </section>

          {/* Conditional Content Rendering */}
          {viewMode === "list" ? (
            <section className="section section--list">
              {loading ? (
                <div className="loading">
                  <div className="loading__spinner animate-spin" />
                  <p className="loading__text">Loading tasks...</p>
                </div>
              ) : (
                <TodoList
                  todos={filteredTodos}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  onViewDetails={handleViewDetails}
                />
              )}
            </section>
          ) : (
            <section className="section section--calendar">
              <CalendarView
                todos={filteredTodos}
                onUpdateTodo={handleUpdateTodo}
                onTodoClick={handleViewDetails}
              />
            </section>
          )}
        </main>

        {selectedTodo && (
          <TodoDetail
            todo={selectedTodo}
            onClose={() => setSelectedTodo(null)}
            onUpdate={handleUpdateTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
