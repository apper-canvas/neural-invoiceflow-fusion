import React from "react"
import Badge from "@/components/atoms/Badge"
import { format, isAfter } from "date-fns"

const StatusBadge = ({ status, dueDate }) => {
  const getStatusVariant = () => {
    if (status === "paid") return "paid"
    if (status === "sent" && dueDate && isAfter(new Date(), new Date(dueDate))) {
      return "overdue"
    }
    return status
  }

  const getStatusText = () => {
    if (status === "sent" && dueDate && isAfter(new Date(), new Date(dueDate))) {
      return "Overdue"
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <Badge variant={getStatusVariant()}>
      {getStatusText()}
    </Badge>
  )
}

export default StatusBadge