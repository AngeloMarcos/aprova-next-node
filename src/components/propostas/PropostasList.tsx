import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, FileText, Eye } from 'lucide-react';
import { Proposta } from '@/hooks/usePropostas';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface PropostasListProps {
  propostas: Proposta[];
  loading: boolean;
  onEdit: (proposta: Proposta) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  rascunho: { label: 'Rascunho', variant: 'secondary' as const },
  em_analise: { label: 'Em Análise', variant: 'default' as const },
  aprovada: { label: 'Aprovada', variant: 'default' as const },
  reprovada: { label: 'Reprovada', variant: 'destructive' as const },
  cancelada: { label: 'Cancelada', variant: 'outline' as const },
};

export function PropostasList({ propostas, loading, onEdit, onDelete }: PropostasListProps) {
  const navigate = useNavigate();

  const handleDelete = (id: string, clienteNome: string) => {
    if (confirm(`Tem certeza que deseja excluir a proposta de "${clienteNome}"?`)) {
      onDelete(id);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <FileText className="h-4 w-4" />
            </TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-32">
                Carregando...
              </TableCell>
            </TableRow>
          ) : propostas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-32">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <FileText className="h-8 w-8" />
                  <p>Nenhuma proposta encontrada</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            propostas.map((proposta) => {
              const statusInfo = statusConfig[proposta.status as keyof typeof statusConfig] || {
                label: proposta.status,
                variant: 'secondary' as const,
              };

              return (
                <TableRow key={proposta.id}>
                  <TableCell>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {proposta.clientes?.nome || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {proposta.bancos?.nome || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {proposta.produtos?.nome || '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(proposta.valor)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(proposta.data), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/propostas/${proposta.id}`)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(proposta)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDelete(proposta.id, proposta.clientes?.nome || 'Cliente')
                        }
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
