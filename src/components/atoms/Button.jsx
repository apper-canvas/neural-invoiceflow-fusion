import React from "react"
import { cn } from "@/utils/cn"

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-white text-secondary border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98]",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-[0.98]",
    ghost: "text-secondary hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.02] active:scale-[0.98]",
    danger: "bg-gradient-to-r from-error to-red-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
    success: "bg-gradient-to-r from-success to-green-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
  }
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
    xl: "h-12 px-8 text-base"
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button