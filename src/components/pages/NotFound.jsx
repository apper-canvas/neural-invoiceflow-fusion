import React from 'react'
import { Link } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name="AlertTriangle" className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-800 transition-colors"
        >
          <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound