import axios from "axios";

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============= TIPOS =============
export interface Product {
  id: string;
  name: string;
  type: "credit" | "consortium" | "financing";
  bank_id: string;
  bank_name?: string;
  min_amount: number;
  max_amount: number;
  min_installments: number;
  max_installments: number;
  interest_rate: number;
  description?: string;
  is_active: boolean;
  createdAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  status: "aberta" | "em_analise" | "aprovada" | "reprovada";
  amount: number;
  clientId: string;
  clientName?: string;
  userId: string;
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  notes?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  createdAt: string;
}

// ============= MOCKS LOCAIS =============
let mockProducts: Product[] = [
  {
    id: "1",
    name: "Crédito Pessoal Turbo",
    type: "credit",
    bank_id: "1",
    bank_name: "Banco do Brasil",
    min_amount: 5000,
    max_amount: 100000,
    min_installments: 12,
    max_installments: 60,
    interest_rate: 1.99,
    description: "Crédito rápido com taxas competitivas",
    is_active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Consórcio Imobiliário Premium",
    type: "consortium",
    bank_id: "2",
    bank_name: "Caixa Econômica Federal",
    min_amount: 100000,
    max_amount: 500000,
    min_installments: 60,
    max_installments: 180,
    interest_rate: 0,
    description: "Consórcio para aquisição de imóveis",
    is_active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Financiamento de Veículos",
    type: "financing",
    bank_id: "1",
    bank_name: "Banco do Brasil",
    min_amount: 20000,
    max_amount: 150000,
    min_installments: 24,
    max_installments: 72,
    interest_rate: 1.45,
    description: "Financiamento de veículos novos e seminovos",
    is_active: true,
    createdAt: new Date().toISOString(),
  },
];

let mockProposals: Proposal[] = [
  {
    id: "1",
    title: "Proposta Crédito Pessoal - João Silva",
    status: "aberta",
    amount: 50000,
    clientId: "1",
    clientName: "João Silva",
    userId: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Proposta Consórcio - Maria Santos",
    status: "em_analise",
    amount: 250000,
    clientId: "2",
    clientName: "Maria Santos",
    userId: "1",
    createdAt: new Date().toISOString(),
  },
];

// Delay para simular latência da API
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// ============= PRODUTOS API =============
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    await simulateDelay();
    // Quando integrar com backend real:
    // return api.get("/produtos").then(res => res.data);
    return mockProducts;
  },

  getById: async (id: string): Promise<Product> => {
    await simulateDelay();
    // return api.get(`/produtos/${id}`).then(res => res.data);
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error("Produto não encontrado");
    return product;
  },

  create: async (data: Omit<Product, "id" | "createdAt" | "bank_name">): Promise<Product> => {
    await simulateDelay();
    // return api.post("/produtos", data).then(res => res.data);
    const newProduct: Product = {
      ...data,
      id: String(mockProducts.length + 1),
      createdAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    await simulateDelay();
    // return api.put(`/produtos/${id}`, data).then(res => res.data);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Produto não encontrado");
    mockProducts[index] = { ...mockProducts[index], ...data };
    return mockProducts[index];
  },

  delete: async (id: string): Promise<void> => {
    await simulateDelay();
    // return api.delete(`/produtos/${id}`).then(res => res.data);
    mockProducts = mockProducts.filter(p => p.id !== id);
  },
};

// ============= PROPOSTAS API =============
export const proposalsApi = {
  getAll: async (): Promise<Proposal[]> => {
    await simulateDelay();
    // return api.get("/propostas").then(res => res.data);
    return mockProposals;
  },

  getById: async (id: string): Promise<Proposal> => {
    await simulateDelay();
    // return api.get(`/propostas/${id}`).then(res => res.data);
    const proposal = mockProposals.find(p => p.id === id);
    if (!proposal) throw new Error("Proposta não encontrada");
    return proposal;
  },

  create: async (data: Omit<Proposal, "id" | "createdAt" | "clientName">): Promise<Proposal> => {
    await simulateDelay();
    // return api.post("/propostas", data).then(res => res.data);
    const newProposal: Proposal = {
      ...data,
      id: String(mockProposals.length + 1),
      createdAt: new Date().toISOString(),
    };
    mockProposals.push(newProposal);
    return newProposal;
  },

  update: async (id: string, data: Partial<Proposal>): Promise<Proposal> => {
    await simulateDelay();
    // return api.put(`/propostas/${id}`, data).then(res => res.data);
    const index = mockProposals.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Proposta não encontrada");
    mockProposals[index] = { ...mockProposals[index], ...data };
    return mockProposals[index];
  },

  delete: async (id: string): Promise<void> => {
    await simulateDelay();
    // return api.delete(`/propostas/${id}`).then(res => res.data);
    mockProposals = mockProposals.filter(p => p.id !== id);
  },
};

// ============= CONFIGURAÇÃO DE AMBIENTE =============
// Para ativar chamadas reais ao backend, altere VITE_API_URL no .env:
// VITE_API_URL=http://localhost:3333/api
// VITE_USE_MOCK=false (implementar flag se necessário)

export default api;
