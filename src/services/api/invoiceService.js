import { toast } from "react-toastify"

export const invoiceService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "client_id_c"}},
          {"field": {"Name": "number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "issue_date_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "total_c"}},
{"field": {"Name": "notes_c"}},
          {"field": {"Name": "remarks_c"}},
          {"field": {"Name": "Tags"}}
        ],
        orderBy: [{"fieldName": "issue_date_c", "sorttype": "DESC"}]
      }

      const response = await apperClient.fetchRecords('invoice_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching invoices:", error?.response?.data?.message || error)
      toast.error("Failed to load invoices")
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
          {"field": {"Name": "client_id_c"}},
          {"field": {"Name": "number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "issue_date_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "total_c"}},
{"field": {"Name": "notes_c"}},
          {"field": {"Name": "remarks_c"}},
          {"field": {"Name": "Tags"}}
        ]
      }

      const response = await apperClient.getRecordById('invoice_c', id, params)
      
      if (!response?.data) {
        return null
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async create(invoiceData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Only include Updateable fields, handle lookup field properly
      const params = {
        records: [{
          Name: invoiceData.number_c || `INV-${Date.now()}`,
          client_id_c: parseInt(invoiceData.client_id_c),
          number_c: invoiceData.number_c || `INV-${Date.now()}`,
          status_c: invoiceData.status_c || "draft",
          issue_date_c: invoiceData.issue_date_c,
          due_date_c: invoiceData.due_date_c,
          items_c: JSON.stringify(invoiceData.items_c || []),
          subtotal_c: parseFloat(invoiceData.subtotal_c) || 0,
          tax_c: parseFloat(invoiceData.tax_c) || 0,
          total_c: parseFloat(invoiceData.total_c) || 0,
notes_c: invoiceData.notes_c || "",
          remarks_c: invoiceData.remarks_c || "",
          Tags: invoiceData.Tags || ""
        }]
      }

      const response = await apperClient.createRecord('invoice_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} invoice records:`, JSON.stringify(failed))
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Invoice created successfully")
          return successful[0].data
        }
      }

      return null
    } catch (error) {
      console.error("Error creating invoice:", error?.response?.data?.message || error)
      toast.error("Failed to create invoice")
      return null
    }
  },

  async update(id, invoiceData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: invoiceData.number_c || invoiceData.Name,
          client_id_c: parseInt(invoiceData.client_id_c),
          number_c: invoiceData.number_c,
          status_c: invoiceData.status_c,
          issue_date_c: invoiceData.issue_date_c,
          due_date_c: invoiceData.due_date_c,
          items_c: typeof invoiceData.items_c === 'string' ? invoiceData.items_c : JSON.stringify(invoiceData.items_c || []),
          subtotal_c: parseFloat(invoiceData.subtotal_c) || 0,
          tax_c: parseFloat(invoiceData.tax_c) || 0,
          total_c: parseFloat(invoiceData.total_c) || 0,
notes_c: invoiceData.notes_c || "",
          remarks_c: invoiceData.remarks_c || "",
          Tags: invoiceData.Tags || ""
        }]
      }

      const response = await apperClient.updateRecord('invoice_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} invoice records:`, JSON.stringify(failed))
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Invoice updated successfully")
          return successful[0].data
        }
      }

      return null
    } catch (error) {
      console.error("Error updating invoice:", error?.response?.data?.message || error)
      toast.error("Failed to update invoice")
      return null
    }
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

      const response = await apperClient.deleteRecord('invoice_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} invoice records:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Invoice deleted successfully")
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Error deleting invoice:", error?.response?.data?.message || error)
      toast.error("Failed to delete invoice")
      return false
    }
  },

  async updateStatus(id, status) {
    return this.update(id, { status_c: status })
  },

  async getStats() {
    try {
      const invoices = await this.getAll()
      
      if (!invoices || invoices.length === 0) {
        return {
          totalRevenue: 0,
          paidAmount: 0,
          pendingAmount: 0,
          draftCount: 0,
          overdueCount: 0,
          totalInvoices: 0
        }
      }

      const total = invoices.reduce((sum, invoice) => sum + (parseFloat(invoice.total_c) || 0), 0)
      const paid = invoices.filter(i => i.status_c === "paid").reduce((sum, invoice) => sum + (parseFloat(invoice.total_c) || 0), 0)
      const pending = invoices.filter(i => i.status_c === "sent").reduce((sum, invoice) => sum + (parseFloat(invoice.total_c) || 0), 0)
      const draft = invoices.filter(i => i.status_c === "draft").length
      const overdue = invoices.filter(i => i.status_c === "sent" && new Date(i.due_date_c) < new Date()).length

      return {
        totalRevenue: total,
        paidAmount: paid,
        pendingAmount: pending,
        draftCount: draft,
        overdueCount: overdue,
        totalInvoices: invoices.length
      }
    } catch (error) {
      console.error("Error getting invoice stats:", error?.response?.data?.message || error)
      return {
        totalRevenue: 0,
        paidAmount: 0,
        pendingAmount: 0,
        draftCount: 0,
        overdueCount: 0,
        totalInvoices: 0
      }
    }
  }
}