import React from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const InvoiceActions = ({ invoice, onStatusChange, onDelete }) => {
  const navigate = useNavigate()

  const handleMarkAsPaid = () => {
    onStatusChange(invoice.Id, "paid")
    toast.success("Invoice marked as paid!")
  }

  const handleMarkAsSent = () => {
    onStatusChange(invoice.Id, "sent")
    toast.success("Invoice marked as sent!")
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      onDelete(invoice.Id)
      toast.success("Invoice deleted successfully")
    }
  }

  const handleDuplicate = () => {
    navigate(`/invoices/new?duplicate=${invoice.Id}`)
  }

  return (
    <div className="flex items-center gap-2">
      {invoice.status !== "paid" && (
        <>
          {invoice.status === "draft" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAsSent}
            >
              <ApperIcon name="Send" className="h-4 w-4 mr-1" />
              Send
            </Button>
          )}
          <Button
            size="sm"
            variant="success"
            onClick={handleMarkAsPaid}
          >
            <ApperIcon name="Check" className="h-4 w-4 mr-1" />
            Mark Paid
          </Button>
        </>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate(`/invoices/edit/${invoice.Id}`)}
      >
        <ApperIcon name="Edit" className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDuplicate}
      >
        <ApperIcon name="Copy" className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        className="text-error hover:text-error hover:bg-error/10"
      >
        <ApperIcon name="Trash2" className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default InvoiceActions