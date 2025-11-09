// Mock authentication system
// In production, replace with real API calls

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operador' | 'consultor';
}

const STORAGE_KEY = 'valida_crm_user';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // Mock login - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === 'admin@validacrm.com' && password === 'admin123') {
      const user: User = {
        id: '1',
        name: 'Administrador',
        email: 'admin@validacrm.com',
        role: 'admin',
      };
      const token = 'mock-jwt-token-' + Date.now();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
      return { user, token };
    }
    
    throw new Error('Credenciais inválidas');
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): { user: User; token: string } | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },
};
