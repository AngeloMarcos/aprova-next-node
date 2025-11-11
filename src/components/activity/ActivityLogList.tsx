import { Activity } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ActivityLog } from '@/hooks/useActivityLog';
import { EmptyState, LoadingSpinner } from '@/components/shared';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ActivityLogListProps {
  logs: ActivityLog[];
  loading: boolean;
}

const actionLabels: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  login: 'Login',
  logout: 'Logout',
};

const actionColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
  login: 'outline',
  logout: 'outline',
};

const entityLabels: Record<string, string> = {
  cliente: 'Cliente',
  banco: 'Banco',
  proposta: 'Proposta',
  produto: 'Produto',
  user: 'Usuário',
};

export function ActivityLogList({ logs, loading }: ActivityLogListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nenhuma atividade encontrada"
        description="Não há registros de atividades com os filtros aplicados."
      />
    );
  }

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Entidade</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="text-right">Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-sm">
                {formatTimestamp(log.timestamp)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{log.user_name || 'Sistema'}</span>
                  <span className="text-sm text-muted-foreground">{log.user_email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={actionColors[log.action] || 'default'}>
                  {actionLabels[log.action] || log.action}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{entityLabels[log.entity_type] || log.entity_type}</Badge>
              </TableCell>
              <TableCell className="font-medium">{log.entity_name || '-'}</TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Detalhes da Atividade</DialogTitle>
                      <DialogDescription>
                        {actionLabels[log.action]} - {entityLabels[log.entity_type]} -{' '}
                        {formatTimestamp(log.timestamp)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Informações Gerais</h4>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <dt className="font-medium">Usuário:</dt>
                          <dd>{log.user_name || 'Sistema'}</dd>
                          <dt className="font-medium">E-mail:</dt>
                          <dd>{log.user_email || '-'}</dd>
                          <dt className="font-medium">Entidade:</dt>
                          <dd>{entityLabels[log.entity_type]}</dd>
                          <dt className="font-medium">Nome da Entidade:</dt>
                          <dd>{log.entity_name || '-'}</dd>
                        </dl>
                      </div>

                      {log.details && (
                        <div>
                          <h4 className="font-semibold mb-2">Detalhes da Ação</h4>
                          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.previous_value && log.action === 'update' && (
                        <div>
                          <h4 className="font-semibold mb-2">Valor Anterior</h4>
                          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                            {JSON.stringify(log.previous_value, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.new_value && (log.action === 'create' || log.action === 'update') && (
                        <div>
                          <h4 className="font-semibold mb-2">Valor Novo</h4>
                          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                            {JSON.stringify(log.new_value, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
