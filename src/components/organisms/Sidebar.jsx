import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Sidebar = ({ className }) => {
  const location = useLocation()

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: "BarChart3",
      current: location.pathname === "/"
    },
    {
      name: "Invoices",
      href: "/invoices",
      icon: "FileText",
      current: location.pathname.startsWith("/invoices")
    },
    {
      name: "Clients",
      href: "/clients",
      icon: "Users",
      current: location.pathname === "/clients"
    }
  ]

  return (
    <div className={cn("bg-white border-r border-gray-200", className)}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Receipt" className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              InvoiceFlow
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
              }
            >
              <ApperIcon name={item.icon} className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Simple invoice management
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar