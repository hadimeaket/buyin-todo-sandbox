#!/usr/bin/env node
/**
 * Simple script to inspect the SQLite database
 * Usage: node inspect-db.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'todos.db');
const db = new Database(dbPath, { readonly: true });

console.log('📊 Database: todos.db\n');

// Get table info
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📋 Tables:', tables.map(t => t.name).join(', '));
console.log();

// Get all todos
const todos = db.prepare('SELECT * FROM todos').all();
console.log(`✅ Total todos: ${todos.length}\n`);

if (todos.length > 0) {
  todos.forEach((todo, index) => {
    console.log(`${index + 1}. ${todo.title}`);
    console.log(`   ID: ${todo.id}`);
    console.log(`   Description: ${todo.description || 'N/A'}`);
    console.log(`   Completed: ${todo.completed ? 'Yes' : 'No'}`);
    console.log(`   Priority: ${todo.priority}`);
    console.log(`   Due Date: ${todo.dueDate || 'N/A'}`);
    console.log(`   Created: ${todo.createdAt}`);
    console.log();
  });
}

db.close();
