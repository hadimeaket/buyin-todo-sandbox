import { pool } from "../config/database";

interface SeedTodo {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  completed?: boolean;
}

const sampleTodos: SeedTodo[] = [
  {
    title: "Welcome to Todo App",
    description:
      "This is a sample todo to get you started. Feel free to delete it!",
    priority: "low",
    completed: false,
  },
  {
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the Todo application",
    priority: "high",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    completed: false,
  },
  {
    title: "Review pull requests",
    description: "Review pending PRs from team members",
    priority: "medium",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    completed: false,
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    console.log("Checking if database needs seeding...");

    // Check if there are already todos
    const countResult = await pool.query("SELECT COUNT(*) FROM todos");
    const count = parseInt(countResult.rows[0].count);

    if (count > 0) {
      console.log(`Database already has ${count} todos, skipping seed.`);
      return;
    }

    console.log("Seeding database with sample todos...");

    for (const todo of sampleTodos) {
      await pool.query(
        `INSERT INTO todos (id, title, description, priority, due_date, completed)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        [
          todo.title,
          todo.description || null,
          todo.priority,
          todo.dueDate || null,
          todo.completed || false,
        ]
      );
    }

    console.log(`✓ Successfully seeded ${sampleTodos.length} sample todos`);
  } catch (error) {
    console.error("✗ Failed to seed database:", error);
    throw error;
  }
}
