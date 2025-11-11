import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityLogFilters as Filters } from '@/hooks/useActivityLog';
import { Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ActivityLogFiltersProps {
  onFilterChange: (filters: Filters) => void;
  users: Array<{ user_id: string; user_name: string; user_email: string }>;
}

export function ActivityLogFilters({ onFilterChange, users }: ActivityLogFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const handleFilterChange = (key: keyof Filters, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">Usuário</Label>
                <Select
                  value={filters.userId || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('userId', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger id="userId">
                    <SelectValue placeholder="Todos os usuários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.user_name || user.user_email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entityType">Tipo de Entidade</Label>
                <Select
                  value={filters.entityType || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('entityType', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger id="entityType">
                    <SelectValue placeholder="Todas as entidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as entidades</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="banco">Banco</SelectItem>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="produto">Produto</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Ação</Label>
                <Select
                  value={filters.action || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('action', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger id="action">
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="create">Criação</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="delete">Exclusão</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
              <Button onClick={applyFilters}>Aplicar Filtros</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
