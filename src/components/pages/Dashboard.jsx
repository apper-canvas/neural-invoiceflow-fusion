import React, { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { invoiceService } from "@/services/api/invoiceService"
import { clientService } from "@/services/api/clientService"
import { format } from "date-fns"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [statsData, invoicesData, clientsData] = await Promise.all([
        invoiceService.getStats(),
        invoiceService.getAll(),
        clientService.getAll()
      ])

      setStats(statsData)
      
      // Get recent invoices with client data
const recentWithClients = invoicesData.slice(0, 5).map(invoice => {
        const client = clientsData.find(c => c.Id === (invoice.client_id_c?.Id || invoice.client_id_c))
        return { ...invoice, clientName: client?.name_c || "Unknown Client" }
      })
      
      setRecentInvoices(recentWithClients)
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error("Dashboard loading error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold text-${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}/10 rounded-lg flex items-center justify-center`}>
          <ApperIcon name={icon} className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your invoice management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon="DollarSign"
          color="primary"
          subtitle={`${stats?.totalInvoices || 0} invoices`}
        />
        <StatCard
          title="Paid Amount"
          value={`$${stats?.paidAmount?.toLocaleString() || 0}`}
          icon="CheckCircle"
          color="success"
        />
        <StatCard
          title="Pending"
          value={`$${stats?.pendingAmount?.toLocaleString() || 0}`}
          icon="Clock"
          color="warning"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueCount || 0}
          icon="AlertTriangle"
          color="error"
          subtitle={`${stats?.draftCount || 0} drafts`}
        />
      </div>

      {/* Recent Invoices */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Invoices</h2>
          <ApperIcon name="FileText" className="h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {recentInvoices.map((invoice) => (
            <div key={invoice.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Receipt" className="h-5 w-5 text-primary" />
                </div>
                <div>
<p className="font-medium text-gray-900">{invoice.number_c}</p>
                  <p className="text-sm text-gray-600">{invoice.clientName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
<p className="font-medium text-gray-900">${(invoice.total_c || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{format(new Date(invoice.issue_date_c), 'MMM dd')}</p>
                </div>
                <Badge variant={invoice.status}>
{(invoice.status_c || "").charAt(0).toUpperCase() + (invoice.status_c || "").slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard