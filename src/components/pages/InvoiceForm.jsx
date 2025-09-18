import React, { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import Card from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { invoiceService } from "@/services/api/invoiceService"
import { clientService } from "@/services/api/clientService"
import { format } from "date-fns"

const InvoiceForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const duplicateId = searchParams.get("duplicate")
  const isEditing = Boolean(id)
  const isDuplicating = Boolean(duplicateId)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clients, setClients] = useState([])
const [formData, setFormData] = useState({
    client_id_c: "",
    number_c: "",
    status_c: "draft",
    issue_date_c: format(new Date(), "yyyy-MM-dd"),
    due_date_c: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    expiry_date_c: format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    items_c: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    subtotal_c: 0,
    tax_c: 10,
    total_c: 0,
notes_c: "",
    remarks_c: ""
  })

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const clientsData = await clientService.getAll()
      setClients(clientsData)

if (isEditing && id) {
        const invoice = await invoiceService.getById(id)
        if (invoice) {
          setFormData({
            ...invoice,
            client_id_c: invoice.client_id_c?.Id || invoice.client_id_c,
            items_c: typeof invoice.items_c === 'string' ? JSON.parse(invoice.items_c) : invoice.items_c || [],
issue_date_c: format(new Date(invoice.issue_date_c), "yyyy-MM-dd"),
            due_date_c: format(new Date(invoice.due_date_c), "yyyy-MM-dd"),
            expiry_date_c: invoice.expiry_date_c ? format(new Date(invoice.expiry_date_c), "yyyy-MM-dd") : format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
            remarks_c: invoice.remarks_c || ""
          })
        }
      } else if (isDuplicating && duplicateId) {
        const invoice = await invoiceService.getById(duplicateId)
        if (invoice) {
          setFormData({
            ...invoice,
            client_id_c: invoice.client_id_c?.Id || invoice.client_id_c,
            number_c: "",
            items_c: typeof invoice.items_c === 'string' ? JSON.parse(invoice.items_c) : invoice.items_c || [],
issue_date_c: format(new Date(), "yyyy-MM-dd"),
            due_date_c: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
            expiry_date_c: format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
status_c: "draft",
            remarks_c: invoice.remarks_c || ""
          })
        }
      }
    } catch (err) {
      setError("Failed to load form data")
      console.error("Form loading error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id, duplicateId])

  const calculateItemAmount = (quantity, rate) => {
    return quantity * rate
  }

const calculateTotals = () => {
    const subtotal = formData.items_c.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = (subtotal * formData.tax_c) / 100
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const handleItemChange = (index, field, value) => {
const newItems = [...formData.items_c]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate amount if quantity or rate changes
    if (field === "quantity" || field === "rate") {
      newItems[index].amount = calculateItemAmount(
        newItems[index].quantity, 
        newItems[index].rate
      )
    }
    
    setFormData({ ...formData, items_c: newItems })
  }

  const addItem = () => {
    setFormData({
...formData,
      items_c: [...formData.items_c, { description: "", quantity: 1, rate: 0, amount: 0 }]
    })
  }

  const removeItem = (index) => {
if (formData.items_c.length > 1) {
      const newItems = formData.items_c.filter((_, i) => i !== index)
      setFormData({ ...formData, items_c: newItems })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
if (!formData.client_id_c) {
      toast.error("Please select a client")
      return
    }

if (formData.items_c.some(item => !item.description)) {
      toast.error("Please fill in all item descriptions")
      return
    }

    try {
      setLoading(true)
      const { subtotal, taxAmount, total } = calculateTotals()
      
      const invoiceData = {
        ...formData,
client_id_c: parseInt(formData.client_id_c),
        number_c: formData.number_c,
        status_c: formData.status_c,
issue_date_c: formData.issue_date_c,
        due_date_c: formData.due_date_c,
        expiry_date_c: formData.expiry_date_c,
        items_c: formData.items_c,
        subtotal_c: subtotal,
        tax_c: taxAmount,
        total_c: total,
notes_c: formData.notes_c,
        remarks_c: formData.remarks_c
      }

      if (isEditing) {
        await invoiceService.update(id, invoiceData)
        toast.success("Invoice updated successfully!")
      } else {
        await invoiceService.create(invoiceData)
        toast.success("Invoice created successfully!")
      }
      
      navigate("/invoices")
    } catch (err) {
      toast.error("Failed to save invoice")
      console.error("Save error:", err)
    } finally {
      setLoading(false)
    }
  }

if (loading && (!formData.client_id_c || clients.length === 0)) {
    return <Loading type="form" />
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => navigate("/invoices")}>
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Invoice" : isDuplicating ? "Duplicate Invoice" : "Create New Invoice"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Client"
value={formData.client_id_c}
              onChange={(e) => setFormData({ ...formData, client_id_c: e.target.value })}
              required
            >
              <option value="">Select a client</option>
{clients.map(client => (
                <option key={client.Id} value={client.Id}>{client.name_c}</option>
              ))}
            </Select>

<Select
              label="Status"
              value={formData.status_c}
              onChange={(e) => setFormData({ ...formData, status_c: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </Select>

            <Input
              type="date"
              label="Issue Date"
value={formData.issue_date_c}
              onChange={(e) => setFormData({ ...formData, issue_date_c: e.target.value })}
              required
            />

            <Input
              type="date"
label="Due Date"
value={formData.due_date_c}
              onChange={(e) => setFormData({ ...formData, due_date_c: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              type="date"
              label="Expiry Date"
              value={formData.expiry_date_c}
              onChange={(e) => setFormData({ ...formData, expiry_date_c: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Line Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>
            <Button type="button" variant="outline" onClick={addItem}>
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
{formData.items_c.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                <div className="md:col-span-5">
                  <Input
                    label="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Describe the service or product"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    label="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                    min="1"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    label="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    label="Amount"
                    value={item.amount}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                
                <div className="md:col-span-1">
{formData.items_c.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-error hover:text-error hover:bg-error/10"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Tax:</span>
                    <Input
                      type="number"
value={formData.tax_c}
                      onChange={(e) => setFormData({ ...formData, tax_c: parseFloat(e.target.value) || 0 })}
                      className="w-16 h-6 text-xs px-2"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-gray-600 ml-1">%</span>
                  </div>
                  <span className="font-medium">${taxAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-primary">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

{/* Invoice Description & Notes */}
<Card className="p-6">
<h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Description & Notes</h2>
<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Invoice Description</label>
<textarea
value={formData.notes_c}
onChange={(e) => setFormData({ ...formData, notes_c: e.target.value })}
placeholder="Describe discounts provided, special terms, payment conditions, or any other important invoice details..."
className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
/>
<p className="text-xs text-gray-500 mt-1">Add details about discounts, promotions, payment terms, or special conditions for this invoice.</p>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Internal Remarks</label>
<textarea
value={formData.remarks_c}
onChange={(e) => setFormData({ ...formData, remarks_c: e.target.value })}
placeholder="Internal notes for team reference..."
className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
/>
<p className="text-xs text-gray-500 mt-1">Private notes for internal use only, not visible to clients.</p>
</div>
</div>
</Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/invoices")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                {isEditing ? "Update Invoice" : "Create Invoice"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default InvoiceForm