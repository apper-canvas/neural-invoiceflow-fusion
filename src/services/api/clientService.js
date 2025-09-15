import { toast } from "react-toastify"

export const clientService = {
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
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "Tags"}}
        ],
        orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}]
      }

      const response = await apperClient.fetchRecords('client_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching clients:", error?.response?.data?.message || error)
      toast.error("Failed to load clients")
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
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "Tags"}}
        ]
      }

      const response = await apperClient.getRecordById('client_c', id, params)
      
      if (!response?.data) {
        return null
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async create(clientData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Only include Updateable fields
      const params = {
        records: [{
          Name: clientData.name_c,
          name_c: clientData.name_c,
          email_c: clientData.email_c || "",
          address_c: clientData.address_c || "",
          phone_c: clientData.phone_c || "",
          Tags: clientData.Tags || ""
        }]
      }

      const response = await apperClient.createRecord('client_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} client records:`, JSON.stringify(failed))
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Client created successfully")
          return successful[0].data
        }
      }

      return null
    } catch (error) {
      console.error("Error creating client:", error?.response?.data?.message || error)
      toast.error("Failed to create client")
      return null
    }
  },

  async update(id, clientData) {
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
          Name: clientData.name_c,
          name_c: clientData.name_c,
          email_c: clientData.email_c || "",
          address_c: clientData.address_c || "",
          phone_c: clientData.phone_c || "",
          Tags: clientData.Tags || ""
        }]
      }

      const response = await apperClient.updateRecord('client_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} client records:`, JSON.stringify(failed))
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Client updated successfully")
          return successful[0].data
        }
      }

      return null
    } catch (error) {
      console.error("Error updating client:", error?.response?.data?.message || error)
      toast.error("Failed to update client")
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

      const response = await apperClient.deleteRecord('client_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} client records:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          toast.success("Client deleted successfully")
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Error deleting client:", error?.response?.data?.message || error)
      toast.error("Failed to delete client")
      return false
    }
  }
}