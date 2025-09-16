import { toast } from "react-toastify";
import React from "react";

export const todosService = {
  async getAll(filters = {}) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "invoice_id_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_date_c"}},
          {"field": {"Name": "assignee_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      }

      // Add status filter if specified
      if (filters.status && filters.status !== 'all') {
        params.where = [
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": [filters.status], "Include": true}
        ]
      }

      // Add search filter if specified
      if (filters.search) {
        const searchConditions = {
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "title_c", "operator": "Contains", "values": [filters.search]}
              ],
              "operator": ""
            },
            {
              "conditions": [
                {"fieldName": "description_c", "operator": "Contains", "values": [filters.search]}
              ],
              "operator": ""
            }
          ]
        }

        if (params.where && params.where.length > 0) {
          params.whereGroups = [searchConditions]
        } else {
          params.whereGroups = [searchConditions]
        }
      }

      // Add invoice filter if specified
      if (filters.invoiceId) {
        const invoiceCondition = {"FieldName": "invoice_id_c", "Operator": "EqualTo", "Values": [parseInt(filters.invoiceId)], "Include": true}
        
        if (params.where && params.where.length > 0) {
          params.where.push(invoiceCondition)
        } else {
          params.where = [invoiceCondition]
        }
      }

      const response = await apperClient.fetchRecords('todo_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching todos:", error?.response?.data?.message || error)
      toast.error("Failed to load todos")
      return []
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "invoice_id_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_date_c"}},
          {"field": {"Name": "assignee_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      }

      const response = await apperClient.getRecordById('todo_c', id, params)
      
      if (!response?.data) {
        return null
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async create(todoData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Only include Updateable fields
      const params = {
        records: [{
          Name: todoData.title_c || `Todo-${Date.now()}`,
          invoice_id_c: todoData.invoice_id_c ? parseInt(todoData.invoice_id_c) : null,
          title_c: todoData.title_c,
          description_c: todoData.description_c || "",
          status_c: todoData.status_c || "pending",
          priority_c: todoData.priority_c || "medium",
          due_date_c: todoData.due_date_c || null,
          completed_date_c: null,
          assignee_c: todoData.assignee_c || "",
          Tags: todoData.Tags || ""
        }]
      }

      const response = await apperClient.createRecord('todo_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} todo records:`, JSON.stringify(failed))
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Todo created successfully")
          return successful[0].data
        }
      }

      return null
    } catch (error) {
      console.error("Error creating todo:", error?.response?.data?.message || error)
      toast.error("Failed to create todo")
      return null
    }
  },

  async update(id, todoData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Get existing todo to handle completed_date_c logic
      const existingTodo = await this.getById(id)
      if (!existingTodo) {
        toast.error("Todo not found")
        return null
      }

      // Handle completed date logic
      let completedDate = existingTodo.completed_date_c
      if (todoData.status_c === 'completed' && existingTodo.status_c !== 'completed') {
        completedDate = new Date().toISOString()
      } else if (todoData.status_c !== 'completed' && existingTodo.status_c === 'completed') {
        completedDate = null
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: todoData.title_c || existingTodo.Name,
          invoice_id_c: todoData.invoice_id_c ? parseInt(todoData.invoice_id_c) : (existingTodo.invoice_id_c?.Id || null),
          title_c: todoData.title_c !== undefined ? todoData.title_c : existingTodo.title_c,
          description_c: todoData.description_c !== undefined ? todoData.description_c : existingTodo.description_c,
          status_c: todoData.status_c !== undefined ? todoData.status_c : existingTodo.status_c,
          priority_c: todoData.priority_c !== undefined ? todoData.priority_c : existingTodo.priority_c,
          due_date_c: todoData.due_date_c !== undefined ? todoData.due_date_c : existingTodo.due_date_c,
          completed_date_c: completedDate,
          assignee_c: todoData.assignee_c !== undefined ? todoData.assignee_c : existingTodo.assignee_c,
          Tags: todoData.Tags !== undefined ? todoData.Tags : existingTodo.Tags
        }]
      }

      const response = await apperClient.updateRecord('todo_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} todo records:`, JSON.stringify(failed))
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Todo updated successfully")
          return successful[0].data
        }
      }

      return null
    } catch (error) {
      console.error("Error updating todo:", error?.response?.data?.message || error)
      toast.error("Failed to update todo")
      return null
    }
  },

  async updateStatus(id, status) {
    return this.update(id, { status_c: status })
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = { 
        RecordIds: [parseInt(id)]
      }

      const response = await apperClient.deleteRecord('todo_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} todo records:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Todo deleted successfully")
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Error deleting todo:", error?.response?.data?.message || error)
      toast.error("Failed to delete todo")
      return false
    }
  },

  async getByInvoiceId(invoiceId) {
    try {
      const todos = await this.getAll({ invoiceId })
      return todos
    } catch (error) {
      console.error(`Error fetching todos for invoice ${invoiceId}:`, error)
      return []
    }
  }
}

// Export singleton instance for backward compatibility
export default new class {
  async getAll(filters) { return todosService.getAll(filters) }
  async getById(id) { return todosService.getById(id) }
  async create(data) { return todosService.create(data) }
  async update(id, data) { return todosService.update(id, data) }
  async updateStatus(id, status) { return todosService.updateStatus(id, status) }
  async delete(id) { return todosService.delete(id) }
  async getByInvoiceId(invoiceId) { return todosService.getByInvoiceId(invoiceId) }
}()

export const todosService = new TodosService();