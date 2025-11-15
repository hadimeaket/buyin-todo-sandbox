import { useState, useEffect } from 'react';
import './App.css';
import type { Todo } from './types/todo';
import { todoApi } from './services/todoApi';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('Failed to load todos. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (title: string) => {
    try {
      setError(null);
      const newTodo = await todoApi.createTodo({ title });
      setTodos([...todos, newTodo]);
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error(err);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      setError(null);
      const updatedTodo = await todoApi.toggleTodo(id);
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setError(null);
      await todoApi.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo Application</h1>
      </header>

      <main className="app-main">
        <div className="todo-container">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)} className="dismiss-button">
                ×
              </button>
            </div>
          )}

          <TodoForm onAdd={handleAddTodo} disabled={loading} />

          {loading ? (
            <div className="loading">Loading todos...</div>
          ) : (
            <TodoList
              todos={todos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
