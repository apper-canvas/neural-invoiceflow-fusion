import invoicesData from "@/services/mockData/invoices.json"

let invoices = [...invoicesData]

const delay = () => new Promise(resolve => setTimeout(resolve, 300))

export const invoiceService = {
  async getAll() {
    await delay()
    return [...invoices].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
  },

  async getById(id) {
    await delay()
    const invoice = invoices.find(invoice => invoice.Id === parseInt(id))
    return invoice ? { ...invoice } : null
  },

  async create(invoiceData) {
    await delay()
    const maxId = Math.max(...invoices.map(i => i.Id), 0)
    const newInvoice = {
      ...invoiceData,
      Id: maxId + 1,
      number: `INV-${String(maxId + 1).padStart(3, "0")}`
    }
    invoices.push(newInvoice)
    return { ...newInvoice }
  },

  async update(id, invoiceData) {
    await delay()
    const index = invoices.findIndex(invoice => invoice.Id === parseInt(id))
    if (index === -1) throw new Error("Invoice not found")
    
    invoices[index] = { ...invoices[index], ...invoiceData }
    return { ...invoices[index] }
  },

  async delete(id) {
    await delay()
    const index = invoices.findIndex(invoice => invoice.Id === parseInt(id))
    if (index === -1) throw new Error("Invoice not found")
    
    invoices.splice(index, 1)
    return true
  },

  async updateStatus(id, status) {
    await delay()
    return this.update(id, { status })
  },

  async getStats() {
    await delay()
    const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const paid = invoices.filter(i => i.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0)
    const pending = invoices.filter(i => i.status === "sent").reduce((sum, invoice) => sum + invoice.total, 0)
    const draft = invoices.filter(i => i.status === "draft").length
    const overdue = invoices.filter(i => i.status === "sent" && new Date(i.dueDate) < new Date()).length

    return {
      totalRevenue: total,
      paidAmount: paid,
      pendingAmount: pending,
      draftCount: draft,
      overdueCount: overdue,
      totalInvoices: invoices.length
    }
  }
}