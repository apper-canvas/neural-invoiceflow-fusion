import React, { useContext, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Sidebar from "@/components/organisms/Sidebar";
import MobileSidebar from "@/components/organisms/MobileSidebar";
import Button from "@/components/atoms/Button";

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const authMethods = useContext(AuthContext)

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
    },
    {
      name: "Todos",
      href: "/todos",
      icon: "CheckSquare",
      current: location.pathname === "/todos"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          navigation={navigation}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
<div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(true)}
                  className="mr-3"
                >
                  <ApperIcon name="Menu" className="h-6 w-6" />
                </Button>
                <div className="flex items-center">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Receipt" className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    InvoiceFlow
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => authMethods?.logout()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ApperIcon name="LogOut" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout