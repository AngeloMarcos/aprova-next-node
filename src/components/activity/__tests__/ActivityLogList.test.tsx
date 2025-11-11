import { render, screen } from '@testing-library/react';
import { ActivityLogList } from '../ActivityLogList';
import { ActivityLog } from '@/hooks/useActivityLog';

const mockLogs: ActivityLog[] = [
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
    details: { cpf: '123.456.789-00' },
    previous_value: null,
    new_value: { nome: 'Test Cliente', cpf: '123.456.789-00' },
    empresa_id: 'empresa-1',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    timestamp: '2024-01-01T11:00:00Z',
    user_id: 'user-2',
    user_email: 'admin@example.com',
    user_name: 'Admin User',
    action: 'update',
    entity_type: 'banco',
    entity_id: 'entity-2',
    entity_name: 'Banco Teste',
    details: {},
    previous_value: { nome: 'Banco Antigo' },
    new_value: { nome: 'Banco Teste' },
    empresa_id: 'empresa-1',
    created_at: '2024-01-01T11:00:00Z',
  },
];

describe('ActivityLogList', () => {
  it('renders loading spinner when loading', () => {
    render(<ActivityLogList logs={[]} loading={true} />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('renders empty state when no logs', () => {
    render(<ActivityLogList logs={[]} loading={false} />);
    expect(screen.getByText(/nenhuma atividade encontrada/i)).toBeInTheDocument();
  });

  it('renders activity logs correctly', () => {
    render(<ActivityLogList logs={mockLogs} loading={false} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('displays action badges with correct labels', () => {
    render(<ActivityLogList logs={mockLogs} loading={false} />);

    expect(screen.getByText('Criação')).toBeInTheDocument();
    expect(screen.getByText('Atualização')).toBeInTheDocument();
  });

  it('displays entity type badges', () => {
    render(<ActivityLogList logs={mockLogs} loading={false} />);

    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByText('Banco')).toBeInTheDocument();
  });

  it('displays entity names', () => {
    render(<ActivityLogList logs={mockLogs} loading={false} />);

    expect(screen.getByText('Test Cliente')).toBeInTheDocument();
    expect(screen.getByText('Banco Teste')).toBeInTheDocument();
  });

  it('shows detail view buttons', () => {
    render(<ActivityLogList logs={mockLogs} loading={false} />);

    const detailButtons = screen.getAllByRole('button');
    expect(detailButtons.length).toBeGreaterThan(0);
  });
});
