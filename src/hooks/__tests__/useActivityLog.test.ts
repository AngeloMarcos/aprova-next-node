import { renderHook, waitFor } from '@testing-library/react';
import { useActivityLog } from '../useActivityLog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useActivityLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchLogs', () => {
    it('should fetch activity logs successfully', async () => {
      const mockLogs = [
        {
          id: '1',
          timestamp: '2024-01-01T10:00:00Z',
          user_id: 'user-1',
          user_email: 'test@example.com',
          user_name: 'Test User',
          action: 'create',
          entity_type: 'cliente',
          entity_id: 'entity-1',
          entity_name: 'Test Cliente',
          details: {},
          empresa_id: 'empresa-1',
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
          count: 1,
        }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      });

      const { result } = renderHook(() => useActivityLog());

      let response;
      await waitFor(async () => {
        response = await result.current.fetchLogs(1, 50);
      });

      expect(response).toEqual({
        data: mockLogs,
        count: 1,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const { result } = renderHook(() => useActivityLog());

      await waitFor(async () => {
        await result.current.fetchLogs(1, 50, {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          userId: 'user-1',
          entityType: 'cliente',
          action: 'create',
        });
      });

      expect(mockQuery.gte).toHaveBeenCalledWith('timestamp', '2024-01-01');
      expect(mockQuery.lte).toHaveBeenCalledWith('timestamp', '2024-12-31');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('entity_type', 'cliente');
      expect(mockQuery.eq).toHaveBeenCalledWith('action', 'create');
    });

    it('should handle fetch errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
          count: 0,
        }),
      });

      const { result } = renderHook(() => useActivityLog());

      let response;
      await waitFor(async () => {
        response = await result.current.fetchLogs();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao carregar log de atividades')
      );
      expect(response).toEqual({
        data: [],
        count: 0,
        totalPages: 0,
      });
    });
  });

  describe('fetchUsers', () => {
    it('should fetch unique users from logs', async () => {
      const mockUsers = [
        { user_id: '1', user_name: 'User 1', user_email: 'user1@test.com' },
        { user_id: '2', user_name: 'User 2', user_email: 'user2@test.com' },
        { user_id: '1', user_name: 'User 1', user_email: 'user1@test.com' }, // Duplicate
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null,
        }),
      });

      const { result } = renderHook(() => useActivityLog());

      let users;
      await waitFor(async () => {
        users = await result.current.fetchUsers();
      });

      expect(users).toHaveLength(2); // Should remove duplicates
      expect(users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ user_id: '1' }),
          expect.objectContaining({ user_id: '2' }),
        ])
      );
    });
  });
});
