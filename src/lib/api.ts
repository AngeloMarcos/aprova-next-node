// Mock API - Replace with real backend calls

export interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  status: 'aberta' | 'em_analise' | 'aprovada' | 'reprovada';
  amount: number;
  clientId: string;
  clientName?: string;
  userId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  totalProposals: number;
  openProposals: number;
  approvedProposals: number;
  totalAmount: number;
}

// Mock data storage
let mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    document: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Oliveira Lima',
    document: '987.654.321-00',
    phone: '(11) 91234-5678',
    email: 'maria.oliveira@email.com',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    createdAt: new Date().toISOString(),
  },
];

let mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Proposta de Crédito Pessoal',
    status: 'em_analise',
    amount: 50000,
    clientId: '1',
    clientName: 'João Silva Santos',
    userId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Consórcio Imobiliário',
    status: 'aprovada',
    amount: 250000,
    clientId: '2',
    clientName: 'Maria Oliveira Lima',
    userId: '1',
    createdAt: new Date().toISOString(),
  },
];

export const api = {
  // Clients
  getClients: async (): Promise<Client[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClients;
  },

  getClient: async (id: string): Promise<Client | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClients.find(c => c.id === id) || null;
  },

  createClient: async (data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newClient: Client = {
      ...data,
      id: String(mockClients.length + 1),
      createdAt: new Date().toISOString(),
    };
    mockClients.push(newClient);
    return newClient;
  },

  updateClient: async (id: string, data: Partial<Client>): Promise<Client> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockClients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cliente não encontrado');
    mockClients[index] = { ...mockClients[index], ...data };
    return mockClients[index];
  },

  deleteClient: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockClients = mockClients.filter(c => c.id !== id);
  },

  // Proposals
  getProposals: async (): Promise<Proposal[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProposals.map(p => ({
      ...p,
      clientName: mockClients.find(c => c.id === p.clientId)?.name,
    }));
  },

  getProposal: async (id: string): Promise<Proposal | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const proposal = mockProposals.find(p => p.id === id);
    if (!proposal) return null;
    return {
      ...proposal,
      clientName: mockClients.find(c => c.id === proposal.clientId)?.name,
    };
  },

  createProposal: async (data: Omit<Proposal, 'id' | 'createdAt' | 'clientName'>): Promise<Proposal> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newProposal: Proposal = {
      ...data,
      id: String(mockProposals.length + 1),
      createdAt: new Date().toISOString(),
      clientName: mockClients.find(c => c.id === data.clientId)?.name,
    };
    mockProposals.push(newProposal);
    return newProposal;
  },

  updateProposal: async (id: string, data: Partial<Proposal>): Promise<Proposal> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockProposals.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Proposta não encontrada');
    mockProposals[index] = { ...mockProposals[index], ...data };
    return {
      ...mockProposals[index],
      clientName: mockClients.find(c => c.id === mockProposals[index].clientId)?.name,
    };
  },

  deleteProposal: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockProposals = mockProposals.filter(p => p.id !== id);
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      totalClients: mockClients.length,
      totalProposals: mockProposals.length,
      openProposals: mockProposals.filter(p => p.status === 'aberta').length,
      approvedProposals: mockProposals.filter(p => p.status === 'aprovada').length,
      totalAmount: mockProposals.reduce((sum, p) => sum + p.amount, 0),
    };
  },
};
