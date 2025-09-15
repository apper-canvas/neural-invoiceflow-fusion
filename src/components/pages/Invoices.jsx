import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/atoms/Button"
import Card from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import SearchBar from "@/components/molecules/SearchBar"
import StatusBadge from "@/components/molecules/StatusBadge"
import InvoiceActions from "@/components/molecules/InvoiceActions"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { invoiceService } from "@/services/api/invoiceService"
import { clientService } from "@/services/api/clientService"
import { format } from "date-fns"

const Invoices = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [invoicesData, clientsData] = await Promise.all([
        invoiceService.getAll(),
        clientService.getAll()
      ])
      
      setInvoices(invoicesData)
      setClients(clientsData)
    } catch (err) {
      setError("Failed to load invoices")
      console.error("Invoices loading error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await invoiceService.updateStatus(invoiceId, newStatus)
setInvoices(prev => prev.map(invoice =>
        invoice.Id === invoiceId ? { ...invoice, status_c: newStatus } : invoice
      ))
    } catch (err) {
      console.error("Status update error:", err)
    }
  }

  const handleDelete = async (invoiceId) => {
try {
      const success = await invoiceService.delete(invoiceId)
      if (success) {
        setInvoices(prev => prev.filter(invoice => invoice.Id !== invoiceId))
      }
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
const client = clients.find(c => c.Id === (invoice.client_id_c?.Id || invoice.client_id_c))
    const clientName = client?.name_c || ""
    
    const matchesSearch = 
(invoice.number_c || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())
    
const matchesStatus = statusFilter === "all" || invoice.status_c === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
          <p className="text-gray-600">Manage and track your invoices</p>
        </div>
        <Button onClick={() => navigate("/invoices/new")} className="w-fit">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search invoices..."
            className="flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </Card>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Empty
          title="No invoices found"
          description="Create your first invoice to get started with managing your billing."
          icon="FileText"
          action={
            <Button onClick={() => navigate("/invoices/new")}>
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
const client = clients.find(c => c.Id === (invoice.client_id_c?.Id || invoice.client_id_c))
            return (
              <Card key={invoice.Id} className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Receipt" className="h-6 w-6 text-primary" />
                    </div>
                    
<div>
                      <h3 className="font-semibold text-gray-900 mb-1">{invoice.number_c}</h3>
                      <p className="text-sm text-gray-600">{client?.name || "Unknown Client"}</p>
                    </div>
                    
                    <div className="hidden sm:block">
                      <p className="text-sm text-gray-500 mb-1">Issue Date</p>
<p className="font-medium text-gray-900">
                        {format(new Date(invoice.issue_date_c), "MMM dd, yyyy")}
                      </p>
                    </div>
                    
                    <div className="hidden sm:block">
<p className="text-sm text-gray-500 mb-1">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(invoice.due_date_c), "MMM dd, yyyy")}
                      </p>
                    </div>
<StatusBadge status={invoice.status_c} dueDate={invoice.due_date_c} />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Amount</p>
                      <p className="font-semibold text-xl text-gray-900">
${(invoice.total_c || 0).toLocaleString()}
                      </p>
                    </div>
                    
                    <InvoiceActions
                      invoice={invoice}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Invoices