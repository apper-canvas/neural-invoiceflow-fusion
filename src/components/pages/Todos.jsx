import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { todosService } from "@/services/api/todosService";
import { invoiceService } from "@/services/api/invoiceService";
import { format } from "date-fns";

const Todos = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title_c: "",
    description_c: "",
    status_c: "pending",
    priority_c: "medium",
    due_date_c: "",
    assignee_c: "",
    invoice_id_c: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [todosData, invoicesData] = await Promise.all([
        todosService.getAll({
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined
        }),
        invoiceService.getAll()
      ]);
      
      setTodos(todosData);
      setInvoices(invoicesData);
    } catch (err) {
      setError("Failed to load todos");
      console.error("Todos loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, searchTerm]);

  const handleStatusChange = async (todoId, newStatus) => {
    try {
      await todosService.updateStatus(todoId, newStatus);
      setTodos(prev => prev.map(todo =>
        todo.Id === todoId ? { ...todo, status_c: newStatus } : todo
      ));
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleDelete = async (todoId) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;
    
    try {
      const success = await todosService.delete(todoId);
      if (success) {
        setTodos(prev => prev.filter(todo => todo.Id !== todoId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title_c.trim()) return;

    try {
      const submitData = {
        ...formData,
        invoice_id_c: formData.invoice_id_c ? parseInt(formData.invoice_id_c) : null
      };

      if (editingTodo) {
        const updatedTodo = await todosService.update(editingTodo.Id, submitData);
        setTodos(prev => prev.map(todo =>
          todo.Id === editingTodo.Id ? updatedTodo : todo
        ));
        setEditingTodo(null);
      } else {
        const newTodo = await todosService.create(submitData);
        setTodos(prev => [newTodo, ...prev]);
        setShowCreateForm(false);
      }

      // Reset form
      setFormData({
        title_c: "",
        description_c: "",
        status_c: "pending",
        priority_c: "medium",
        due_date_c: "",
        assignee_c: "",
        invoice_id_c: ""
      });
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title_c: todo.title_c || "",
      description_c: todo.description_c || "",
      status_c: todo.status_c || "pending",
      priority_c: todo.priority_c || "medium",
      due_date_c: todo.due_date_c || "",
      assignee_c: todo.assignee_c || "",
      invoice_id_c: todo.invoice_id_c?.Id || todo.invoice_id_c || ""
    });
    setShowCreateForm(true);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingTodo(null);
    setFormData({
      title_c: "",
      description_c: "",
      status_c: "pending",
      priority_c: "medium",
      due_date_c: "",
      assignee_c: "",
      invoice_id_c: ""
    });
  };

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    const matchesPriority = priorityFilter === "all" || todo.priority_c === priorityFilter;
    return matchesPriority;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "Clock",
      in_progress: "Play",
      completed: "CheckCircle",
      cancelled: "XCircle"
    };
    return icons[status] || "Clock";
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todos</h1>
          <p className="text-gray-600">Manage tasks and follow-ups for your invoices</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="w-fit">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          New Todo
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingTodo ? "Edit Todo" : "Create New Todo"}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleCancelForm}>
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Title"
                  value={formData.title_c}
                  onChange={(e) => setFormData({...formData, title_c: e.target.value})}
                  placeholder="Enter todo title..."
                  required
                />
              </div>
              
              <Select
                label="Status"
                value={formData.status_c}
                onChange={(e) => setFormData({...formData, status_c: e.target.value})}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" }
                ]}
              />
              
              <Select
                label="Priority"
                value={formData.priority_c}
                onChange={(e) => setFormData({...formData, priority_c: e.target.value})}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" }
                ]}
              />
              
              <Input
                label="Due Date"
                type="date"
                value={formData.due_date_c}
                onChange={(e) => setFormData({...formData, due_date_c: e.target.value})}
              />
              
              <Input
                label="Assignee"
                value={formData.assignee_c}
                onChange={(e) => setFormData({...formData, assignee_c: e.target.value})}
                placeholder="Enter assignee name..."
              />
              
              <Select
                label="Related Invoice"
                value={formData.invoice_id_c}
                onChange={(e) => setFormData({...formData, invoice_id_c: e.target.value})}
                options={[
                  { value: "", label: "No Invoice" },
                  ...invoices.map(invoice => ({
                    value: invoice.Id.toString(),
                    label: `${invoice.number_c} - ${invoice.client_id_c?.Name || 'Unknown Client'}`
                  }))
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description_c}
                onChange={(e) => setFormData({...formData, description_c: e.target.value})}
                placeholder="Enter todo description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancelForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTodo ? "Update Todo" : "Create Todo"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search todos..."
            className="flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </Card>

      {/* Todos List */}
      {filteredTodos.length === 0 ? (
        <Empty
          title="No todos found"
          description="Create your first todo to start managing tasks and follow-ups."
          icon="CheckSquare"
          action={
            <Button onClick={() => setShowCreateForm(true)}>
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Create Todo
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo) => {
            const invoice = invoices.find(inv => inv.Id === (todo.invoice_id_c?.Id || todo.invoice_id_c));
            return (
              <Card key={todo.Id} className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ApperIcon name={getStatusIcon(todo.status_c)} className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 mb-1">{todo.title_c}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(todo.priority_c)}>
                            {todo.priority_c}
                          </Badge>
                          <Badge className={getStatusColor(todo.status_c)}>
                            {todo.status_c.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {todo.description_c && (
                        <p className="text-gray-600 mb-3">{todo.description_c}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {todo.assignee_c && (
                          <div className="flex items-center">
                            <ApperIcon name="User" className="h-4 w-4 mr-1" />
                            {todo.assignee_c}
                          </div>
                        )}
                        
                        {todo.due_date_c && (
                          <div className="flex items-center">
                            <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
                            Due {format(new Date(todo.due_date_c), "MMM dd, yyyy")}
                          </div>
                        )}
                        
                        {invoice && (
                          <div className="flex items-center">
                            <ApperIcon name="FileText" className="h-4 w-4 mr-1" />
                            {invoice.number_c}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <ApperIcon name="Clock" className="h-4 w-4 mr-1" />
                          {format(new Date(todo.CreatedOn), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {todo.status_c !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(todo.Id, "completed")}
                      >
                        <ApperIcon name="Check" className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(todo)}
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(todo.Id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Todos;