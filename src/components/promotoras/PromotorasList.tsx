import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, UserCircle } from 'lucide-react';
import { Promotora } from '@/hooks/usePromotoras';
import { format } from 'date-fns';

interface PromotorasListProps {
  promotoras: Promotora[];
  onEdit: (promotora: Promotora) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function PromotorasList({ promotoras, onEdit, onDelete, isLoading }: PromotorasListProps) {
  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (promotoras.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotoras.map((promotora) => (
              <TableRow key={promotora.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    {promotora.nome}
                  </div>
                </TableCell>
                <TableCell>{promotora.bancos?.nome || '-'}</TableCell>
                <TableCell>{promotora.email || '-'}</TableCell>
                <TableCell>{promotora.telefone || '-'}</TableCell>
                <TableCell>
                  {promotora.comissao_padrao ? `${promotora.comissao_padrao}%` : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={promotora.ativo ? 'default' : 'secondary'}>
                    {promotora.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(promotora)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(promotora.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {promotoras.map((promotora) => (
          <Card key={promotora.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">{promotora.nome}</h3>
                  </div>
                  <Badge variant={promotora.ativo ? 'default' : 'secondary'}>
                    {promotora.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banco:</span>
                    <span>{promotora.bancos?.nome || '-'}</span>
                  </div>
                  {promotora.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">E-mail:</span>
                      <span className="truncate ml-2">{promotora.email}</span>
                    </div>
                  )}
                  {promotora.telefone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span>{promotora.telefone}</span>
                    </div>
                  )}
                  {promotora.comissao_padrao && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comissão:</span>
                      <span>{promotora.comissao_padrao}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cadastrado:</span>
                    <span>{format(new Date(promotora.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(promotora)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onDelete(promotora.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
