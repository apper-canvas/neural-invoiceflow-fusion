import clientsData from "@/services/mockData/clients.json"

let clients = [...clientsData]

const delay = () => new Promise(resolve => setTimeout(resolve, 200))

export const clientService = {
  async getAll() {
    await delay()
    return [...clients].sort((a, b) => a.name.localeCompare(b.name))
  },

  async getById(id) {
    await delay()
    const client = clients.find(client => client.Id === parseInt(id))
    return client ? { ...client } : null
  },

  async create(clientData) {
    await delay()
    const maxId = Math.max(...clients.map(c => c.Id), 0)
    const newClient = {
      ...clientData,
      Id: maxId + 1
    }
    clients.push(newClient)
    return { ...newClient }
  },

  async update(id, clientData) {
    await delay()
    const index = clients.findIndex(client => client.Id === parseInt(id))
    if (index === -1) throw new Error("Client not found")
    
    clients[index] = { ...clients[index], ...clientData }
    return { ...clients[index] }
  },

  async delete(id) {
    await delay()
    const index = clients.findIndex(client => client.Id === parseInt(id))
    if (index === -1) throw new Error("Client not found")
    
    clients.splice(index, 1)
    return true
  }
}