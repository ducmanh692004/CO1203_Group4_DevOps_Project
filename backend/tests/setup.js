// Mock PostgreSQL database for testing
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
  };
  
  return {
    Pool: jest.fn(() => mockPool),
  };
});

// Setup mock data store (simulate database)
let todos = [];
let todoIdCounter = 1;

// Get the mock Pool
const pg = require('pg');
const mockPool = new pg.Pool();

// Setup mock implementation
mockPool.query.mockImplementation((query, params) => {
  // CREATE TABLE
  if (query.includes('CREATE TABLE')) {
    return Promise.resolve();
  }

  // GET all todos
  if (query.includes('SELECT * FROM todos')) {
    return Promise.resolve({ rows: todos });
  }

  // INSERT todo
  if (query.includes('INSERT INTO todos')) {
    const [title, completed] = params;
    const newTodo = {
      id: todoIdCounter++,
      title,
      completed,
      created_at: new Date(),
    };
    todos.push(newTodo);
    return Promise.resolve({ rows: [newTodo] });
  }

  // UPDATE todo
  if (query.includes('UPDATE todos')) {
    const [title, completed, id] = params;
    const todoIndex = todos.findIndex(t => t.id === parseInt(id));
    if (todoIndex === -1) {
      return Promise.resolve({ rows: [] });
    }
    todos[todoIndex] = { ...todos[todoIndex], title, completed };
    return Promise.resolve({ rows: [todos[todoIndex]] });
  }

  // DELETE todo
  if (query.includes('DELETE FROM todos')) {
    const [id] = params;
    const todoIndex = todos.findIndex(t => t.id === parseInt(id));
    if (todoIndex === -1) {
      return Promise.resolve({ rows: [] });
    }
    todos.splice(todoIndex, 1);
    return Promise.resolve({ rows: [{ id }] });
  }

  return Promise.resolve({ rows: [] });
});

// Reset todos before each test
beforeEach(() => {
  todos = [];
  todoIdCounter = 1;
  mockPool.query.mockClear();
});
