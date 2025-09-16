import { toast } from 'react-toastify';
import mockTodos from '../mockData/todos.json';

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TodosService {
  constructor() {
    // Store data in memory for this session
    this.todos = [...mockTodos];
    this.nextId = Math.max(...this.todos.map(t => t.Id)) + 1;
  }

  async getAll(filters = {}) {
    try {
      await delay(300);
      
      let filteredTodos = [...this.todos];
      
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.status_c === filters.status);
      }
      
      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredTodos = filteredTodos.filter(todo =>
          (todo.title_c || '').toLowerCase().includes(searchTerm) ||
          (todo.description_c || '').toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply invoice filter
      if (filters.invoiceId) {
        filteredTodos = filteredTodos.filter(todo => 
          todo.invoice_id_c?.Id === filters.invoiceId || todo.invoice_id_c === filters.invoiceId
        );
      }
      
      // Sort by created date (newest first)
      filteredTodos.sort((a, b) => new Date(b.CreatedOn) - new Date(a.CreatedOn));
      
      return filteredTodos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load todos');
      throw error;
    }
  }

  async getById(id) {
    try {
      await delay(200);
      
      const todo = this.todos.find(t => t.Id === parseInt(id));
      if (!todo) {
        throw new Error('Todo not found');
      }
      
      return { ...todo };
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error);
      toast.error('Failed to load todo');
      throw error;
    }
  }

  async create(todoData) {
    try {
      await delay(400);
      
      // Validate required fields
      if (!todoData.title_c || !todoData.status_c) {
        throw new Error('Title and status are required');
      }
      
      const newTodo = {
        Id: this.nextId++,
        Name: todoData.title_c, // Auto-generate name from title
        Tags: todoData.Tags || "",
        Owner: null, // Will be set by system
        CreatedOn: new Date().toISOString(),
        CreatedBy: null, // Will be set by system
        ModifiedOn: new Date().toISOString(),
        ModifiedBy: null, // Will be set by system
        invoice_id_c: todoData.invoice_id_c || null,
        title_c: todoData.title_c,
        description_c: todoData.description_c || "",
        status_c: todoData.status_c || "pending",
        priority_c: todoData.priority_c || "medium",
        due_date_c: todoData.due_date_c || null,
        completed_date_c: null,
        assignee_c: todoData.assignee_c || ""
      };
      
      this.todos.push(newTodo);
      toast.success('Todo created successfully');
      
      return { ...newTodo };
    } catch (error) {
      console.error('Error creating todo:', error);
      toast.error(error.message || 'Failed to create todo');
      throw error;
    }
  }

  async update(id, todoData) {
    try {
      await delay(350);
      
      const todoIndex = this.todos.findIndex(t => t.Id === parseInt(id));
      if (todoIndex === -1) {
        throw new Error('Todo not found');
      }
      
      const existingTodo = this.todos[todoIndex];
      const updatedTodo = {
        ...existingTodo,
        ...todoData,
        Id: existingTodo.Id, // Preserve ID
        ModifiedOn: new Date().toISOString(),
        // Auto-set completed date when status changes to completed
        completed_date_c: todoData.status_c === 'completed' && existingTodo.status_c !== 'completed' 
          ? new Date().toISOString() 
          : existingTodo.completed_date_c,
        // Clear completed date if status changes from completed
        ...(todoData.status_c !== 'completed' && existingTodo.status_c === 'completed' 
          ? { completed_date_c: null } 
          : {})
      };
      
      this.todos[todoIndex] = updatedTodo;
      toast.success('Todo updated successfully');
      
      return { ...updatedTodo };
    } catch (error) {
      console.error(`Error updating todo ${id}:`, error);
      toast.error(error.message || 'Failed to update todo');
      throw error;
    }
  }

  async updateStatus(id, status) {
    try {
      return await this.update(id, { status_c: status });
    } catch (error) {
      console.error(`Error updating todo status ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await delay(300);
      
      const todoIndex = this.todos.findIndex(t => t.Id === parseInt(id));
      if (todoIndex === -1) {
        throw new Error('Todo not found');
      }
      
      this.todos.splice(todoIndex, 1);
      toast.success('Todo deleted successfully');
      
      return true;
    } catch (error) {
      console.error(`Error deleting todo ${id}:`, error);
      toast.error(error.message || 'Failed to delete todo');
      throw error;
    }
  }

  async getByInvoiceId(invoiceId) {
    try {
      const todos = await this.getAll({ invoiceId });
      return todos;
    } catch (error) {
      console.error(`Error fetching todos for invoice ${invoiceId}:`, error);
      throw error;
    }
  }
}

export const todosService = new TodosService();