import { initDatabase } from "./database";
import { todoRepository } from "../repositories/TodoRepository";
import { userRepository } from "../repositories/UserRepository";

async function seed() {
  console.log("🌱 Seeding database...");

  initDatabase();

  // Create test user
  console.log("👤 Creating test user...");
  const testUser = await userRepository.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
  console.log(`✅ Created user: ${testUser.email} (ID: ${testUser.id})`);

  const dummyTodos = [
    {
      title: "Team Meeting vorbereiten",
      description: "Agenda erstellen und an alle senden",
      priority: "high" as const,
      dueDate: "2025-12-10T10:00:00.000Z",
      isAllDay: false,
      startTime: "10:00",
      endTime: "11:00",
    },
    {
      title: "Wocheneinkauf",
      description: "Lebensmittel für die Woche besorgen",
      priority: "medium" as const,
      dueDate: "2025-12-11T00:00:00.000Z",
      isAllDay: true,
    },
    {
      title: "Code Review durchführen",
      description: "Pull Requests von Sarah und Tom reviewen",
      priority: "high" as const,
      dueDate: "2025-12-09T16:00:00.000Z",
      isAllDay: false,
      startTime: "16:00",
      endTime: "17:00",
    },
    {
      title: "Fitnessstudio",
      description: "Cardio und Krafttraining",
      priority: "low" as const,
      dueDate: "2025-12-12T00:00:00.000Z",
      isAllDay: true,
      recurrence: "weekly" as const,
    },
    {
      title: "Projektdokumentation aktualisieren",
      description: "README und API-Docs auf den neuesten Stand bringen",
      priority: "medium" as const,
    },
    {
      title: "Geburtstag Lisa",
      description: "Geschenk besorgen",
      priority: "high" as const,
      dueDate: "2025-12-15T00:00:00.000Z",
      isAllDay: true,
    },
    {
      title: "Newsletter abonnieren",
      description: "Tech-Newsletter von verschiedenen Quellen",
      priority: "low" as const,
    },
    {
      title: "Backup durchführen",
      description: "Wöchentliches System-Backup",
      priority: "medium" as const,
      dueDate: "2025-12-13T00:00:00.000Z",
      isAllDay: true,
      recurrence: "weekly" as const,
    },
  ];

  for (const todo of dummyTodos) {
    await todoRepository.create(todo, testUser.id);
  }

  console.log(`✅ Created ${dummyTodos.length} todos`);

  // Verify
  const allTodos = await todoRepository.findAll(testUser.id);
  console.log(`📊 Total todos in database: ${allTodos.length}`);

  console.log("\n📋 All todos:");
  allTodos.forEach((todo) => {
    console.log(
      `  - [${todo.completed ? "✓" : " "}] ${todo.title} (${todo.priority})`
    );
  });

  // Test toggle
  if (allTodos.length > 0) {
    const firstTodo = allTodos[0];
    console.log(`\n🔄 Testing toggle on: "${firstTodo.title}"`);
    const toggled = await todoRepository.toggle(firstTodo.id, testUser.id);
    console.log(
      `   Completed: ${firstTodo.completed} -> ${toggled?.completed}`
    );
  }

  // Test update
  if (allTodos.length > 1) {
    const secondTodo = allTodos[1];
    console.log(`\n✏️  Testing update on: "${secondTodo.title}"`);
    const updated = await todoRepository.update(secondTodo.id, testUser.id, {
      description: "UPDATED: " + secondTodo.description,
    });
    console.log(`   Description updated: ${updated?.description}`);
  }

  // Test delete
  if (allTodos.length > 2) {
    const thirdTodo = allTodos[2];
    console.log(`\n🗑️  Testing delete on: "${thirdTodo.title}"`);
    const deleted = await todoRepository.delete(thirdTodo.id, testUser.id);
    console.log(`   Deleted: ${deleted}`);
    const remaining = await todoRepository.findAll(testUser.id);
    console.log(`   Remaining todos: ${remaining.length}`);
  }

  console.log("\n✨ Seeding complete!");
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
