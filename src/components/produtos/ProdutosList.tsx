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
import { Pencil, Trash2, Package } from 'lucide-react';
import { Produto } from '@/hooks/useProdutos';
import { format } from 'date-fns';

interface ProdutosListProps {
  produtos: Produto[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  isLoading?: boolean;
}

export function ProdutosList({ 
  produtos, 
  onEdit, 
  onDelete, 
  onStatusChange,
  isLoading 
}: ProdutosListProps) {
  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case 'ativo':
        return 'default';
      case 'inativo':
        return 'secondary';
      case 'suspenso':
        return 'destructive';
      default:
        return 'outline';
    }
  };

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
                <TableHead>Tipo</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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

  if (produtos.length === 0) {
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
              <TableHead>Tipo</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {produto.nome}
                  </div>
                </TableCell>
                <TableCell>{produto.bancos?.nome || '-'}</TableCell>
                <TableCell className="capitalize">{produto.tipo_credito || '-'}</TableCell>
                <TableCell>
                  {produto.taxa_juros ? `${produto.taxa_juros}% a.m.` : '-'}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusVariant(produto.status)}
                    className="cursor-pointer"
                    onClick={() => onStatusChange(produto.id, produto.status === 'ativo' ? 'inativo' : 'ativo')}
                  >
                    {produto.status || 'ativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(produto)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(produto.id)}
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
        {produtos.map((produto) => (
          <Card key={produto.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">{produto.nome}</h3>
                  </div>
                  <Badge 
                    variant={getStatusVariant(produto.status)}
                    className="cursor-pointer"
                    onClick={() => onStatusChange(produto.id, produto.status === 'ativo' ? 'inativo' : 'ativo')}
                  >
                    {produto.status || 'ativo'}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banco:</span>
                    <span>{produto.bancos?.nome || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="capitalize">{produto.tipo_credito || '-'}</span>
                  </div>
                  {produto.taxa_juros && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa:</span>
                      <span>{produto.taxa_juros}% a.m.</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cadastrado:</span>
                    <span>{format(new Date(produto.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(produto)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onDelete(produto.id)}
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
