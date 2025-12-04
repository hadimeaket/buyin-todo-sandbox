#!/usr/bin/env ts-node

// Direkter Test ohne HTTP-Requests
import { categoryRepository } from "./src/repositories/CategoryRepository";
import { todoRepository } from "./src/repositories/TodoRepository";
import { categoryService } from "./src/services/CategoryService";
import { todoService } from "./src/services/TodoService";
import { userRepository } from "./src/repositories/UserRepository";
import * as bcrypt from "bcrypt";

async function runTests() {
  console.log("=== Kategorien-Tests starten ===\n");

  // Test-User erstellen
  const passwordHash = await bcrypt.hash("Test1234", 10);
  const testUser = await userRepository.create({
    email: "direct_test@example.com",
    password: "Test1234",
  });
  const userId = testUser.id;

  console.log(`✓ Test-User erstellt: ${testUser.email} (ID: ${userId})\n`);

  // Test 1: Gültige Kategorien erstellen
  console.log("=== Test 1: Gültige Kategorien erstellen ===");
  try {
    const cat1 = await categoryService.createCategory(
      { name: "Arbeit", color: "#FF0000" },
      userId
    );
    console.log(`✓ Kategorie "Arbeit" erstellt: ${cat1.color}`);

    const cat2 = await categoryService.createCategory(
      { name: "Privat", color: "#00FF00" },
      userId
    );
    console.log(`✓ Kategorie "Privat" erstellt: ${cat2.color}`);

    const cat3 = await categoryService.createCategory(
      { name: "Urgent", color: "#00F" },
      userId
    );
    console.log(`✓ Kategorie "Urgent" erstellt (Kurzformat): ${cat3.color}\n`);
  } catch (error: any) {
    console.error(`✗ Fehler: ${error.message}\n`);
  }

  // Test 2: Ungültige Farben
  console.log("=== Test 2: Ungültige HEX-Farben (sollten Fehler werfen) ===");

  try {
    await categoryService.createCategory(
      { name: "Invalid1", color: "FF0000" },
      userId
    );
    console.log("✗ Fehler: Sollte Validierungsfehler werfen");
  } catch (error: any) {
    console.log(`✓ Erwarteter Fehler: ${error.message}`);
  }

  try {
    await categoryService.createCategory(
      { name: "Invalid2", color: "#GGGGGG" },
      userId
    );
    console.log("✗ Fehler: Sollte Validierungsfehler werfen");
  } catch (error: any) {
    console.log(`✓ Erwarteter Fehler: ${error.message}`);
  }

  try {
    await categoryService.createCategory(
      { name: "Invalid3", color: "#12345" },
      userId
    );
    console.log("✗ Fehler: Sollte Validierungsfehler werfen");
  } catch (error: any) {
    console.log(`✓ Erwarteter Fehler: ${error.message}\n`);
  }

  // Test 3: Alle Kategorien abrufen
  console.log("=== Test 3: Alle Kategorien abrufen ===");
  const categories = await categoryService.getAllCategories(userId);
  console.log(`✓ ${categories.length} Kategorien gefunden:`);
  categories.forEach((cat) => {
    console.log(`  - ${cat.name}: ${cat.color}`);
  });
  console.log();

  // Test 4: Todos mit Kategorien erstellen
  console.log("=== Test 4: Todos mit Kategorien erstellen ===");
  const arbeitCat = categories.find((c) => c.name === "Arbeit");
  const privatCat = categories.find((c) => c.name === "Privat");

  if (arbeitCat) {
    const todo1 = await todoService.createTodo(
      {
        title: "Meeting vorbereiten",
        description: "Agenda erstellen",
        categoryId: arbeitCat.id,
      },
      userId
    );
    console.log(`✓ Todo erstellt: "${todo1.title}"`);
    console.log(
      `  Kategorie: ${todo1.category?.name} (${todo1.category?.color})`
    );
  }

  if (privatCat) {
    const todo2 = await todoService.createTodo(
      {
        title: "Einkaufen gehen",
        categoryId: privatCat.id,
      },
      userId
    );
    console.log(`✓ Todo erstellt: "${todo2.title}"`);
    console.log(
      `  Kategorie: ${todo2.category?.name} (${todo2.category?.color})`
    );
  }

  const todo3 = await todoService.createTodo(
    { title: "Allgemeine Aufgabe" },
    userId
  );
  console.log(`✓ Todo ohne Kategorie erstellt: "${todo3.title}"`);
  console.log(
    `  Kategorie: ${todo3.category ? todo3.category.name : "Keine"}\n`
  );

  // Test 5: Ungültige Kategorie-ID
  console.log("=== Test 5: Todo mit ungültiger Kategorie-ID ===");
  try {
    await todoService.createTodo(
      {
        title: "Fehlerhaft",
        categoryId: "invalid-uuid-12345",
      },
      userId
    );
    console.log("✗ Fehler: Sollte Validierungsfehler werfen");
  } catch (error: any) {
    console.log(`✓ Erwarteter Fehler: ${error.message}\n`);
  }

  // Test 6: Alle Todos mit Kategorien abrufen
  console.log("=== Test 6: Alle Todos mit Kategorie-Informationen ===");
  const todos = await todoService.getAllTodos(userId);
  console.log(`✓ ${todos.length} Todos gefunden:`);
  todos.forEach((todo) => {
    const catInfo = todo.category
      ? `${todo.category.name} (${todo.category.color})`
      : "Keine Kategorie";
    console.log(`  - ${todo.title}: ${catInfo}`);
  });
  console.log();

  // Test 7: Kategorie löschen
  console.log("=== Test 7: Kategorie löschen ===");
  if (arbeitCat) {
    await categoryService.deleteCategory(arbeitCat.id, userId);
    console.log(`✓ Kategorie "${arbeitCat.name}" gelöscht`);

    const todosAfterDelete = await todoService.getAllTodos(userId);
    const affectedTodo = todosAfterDelete.find(
      (t) => t.title === "Meeting vorbereiten"
    );
    console.log(
      `✓ Todo-Kategorie entfernt: categoryId = ${
        affectedTodo?.categoryId || "null"
      }\n`
    );
  }

  console.log("=== Alle Tests abgeschlossen ===");
  process.exit(0);
}

runTests().catch((error) => {
  console.error("Test fehlgeschlagen:", error);
  process.exit(1);
});
