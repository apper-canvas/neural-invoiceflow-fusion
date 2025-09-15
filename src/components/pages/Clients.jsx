import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Card from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import SearchBar from "@/components/molecules/SearchBar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { clientService } from "@/services/api/clientService"

const Clients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: ""
  })

  const loadClients = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await clientService.getAll()
      setClients(data)
    } catch (err) {
      setError("Failed to load clients")
      console.error("Clients loading error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const resetForm = () => {
    setFormData({ name: "", email: "", address: "", phone: "" })
    setEditingClient(null)
    setShowForm(false)
  }

  const handleEdit = (client) => {
    setFormData(client)
    setEditingClient(client)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Client name is required")
      return
    }

    try {
      if (editingClient) {
        const updated = await clientService.update(editingClient.Id, formData)
        setClients(prev => prev.map(client => 
          client.Id === editingClient.Id ? updated : client
        ))
        toast.success("Client updated successfully!")
      } else {
        const newClient = await clientService.create(formData)
        setClients(prev => [...prev, newClient])
        toast.success("Client created successfully!")
      }
      
      resetForm()
    } catch (err) {
      toast.error("Failed to save client")
      console.error("Save error:", err)
    }
  }

  const handleDelete = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await clientService.delete(clientId)
        setClients(prev => prev.filter(client => client.Id !== clientId))
        toast.success("Client deleted successfully")
      } catch (err) {
        toast.error("Failed to delete client")
        console.error("Delete error:", err)
      }
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadClients} />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">Manage your client information</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-fit">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search clients..."
        />
      </Card>

      {/* Client Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingClient ? "Edit Client" : "Add New Client"}
            </h2>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
                required
              />
              
              <Input
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                {editingClient ? "Update Client" : "Add Client"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Empty
          title="No clients found"
          description="Add your first client to start creating invoices for them."
          icon="Users"
          action={
            <Button onClick={() => setShowForm(true)}>
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.Id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Building" className="h-6 w-6 text-primary" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(client)}
                  >
                    <ApperIcon name="Edit" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(client.Id)}
                    className="text-error hover:text-error hover:bg-error/10"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {client.name}
                  </h3>
                </div>

                {client.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="Mail" className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="Phone" className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <ApperIcon name="MapPin" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Clients