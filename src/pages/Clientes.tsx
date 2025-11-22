import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CadastrosLayout } from '@/components/CadastrosLayout';
import { CadastroEmptyState } from '@/components/CadastroEmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Edit, Trash2, Users } from 'lucide-react';
import { useClientes, Cliente } from '@/hooks/useClientes';
import { ClienteFormModal } from '@/components/clientes/ClienteFormModal';
import { DeleteAlertDialog } from '@/components/shared/DeleteAlertDialog';
import { ClienteFormValues } from '@/lib/validations/clientes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Clientes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openNew = searchParams.get('new');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    clientes,
    loading,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  } = useClientes();

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        fetchClientes(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchClientes();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (openNew === 'true') {
      handleOpenDialog();
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [openNew]);

  const handleOpenDialog = () => {
    setEditingCliente(undefined);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: ClienteFormValues) => {
    const formData = {
      nome: data.nome,
      cpf: data.cpf,
      email: data.email || undefined,
    };
    
    if (editingCliente) {
      return await updateCliente(editingCliente.id, formData);
    } else {
      return await createCliente(formData);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setClienteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (clienteToDelete) {
      await deleteCliente(clienteToDelete);
      setDeleteDialogOpen(false);
      setClienteToDelete(null);
    }
  };

  return (
    <CadastrosLayout
      titulo="Clientes"
      descricao="Gerencie os clientes da sua empresa"
      botaoNovoLabel="Novo Cliente"
      onNovoClick={handleOpenDialog}
      isLoading={loading && clientes.length === 0}
    >
      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && clientes.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && clientes.length === 0 && !searchTerm && (
        <CadastroEmptyState
          titulo="Nenhum cliente cadastrado"
          descricao="Comece cadastrando seu primeiro cliente para gerenciar propostas."
          botaoLabel="Cadastrar Primeiro Cliente"
          onNovoClick={handleOpenDialog}
          icone={<Users className="h-12 w-12" />}
        />
      )}

      {/* No Results */}
      {!loading && clientes.length === 0 && searchTerm && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum cliente encontrado com "{searchTerm}"</p>
        </Card>
      )}

      {/* Desktop Table */}
      {clientes.length > 0 && (
        <div className="hidden md:block">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.cpf}</TableCell>
                    <TableCell>{cliente.email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(cliente)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(cliente.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Mobile Cards */}
      {clientes.length > 0 && (
        <div className="md:hidden space-y-3">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{cliente.nome}</h3>
                  <p className="text-sm text-muted-foreground">{cliente.cpf}</p>
                  {cliente.email && (
                    <p className="text-sm text-muted-foreground">{cliente.email}</p>
                  )}
                </div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(cliente)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteClick(cliente.id)} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ClienteFormModal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        cliente={editingCliente}
        isLoading={loading}
      />

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        isLoading={loading}
      />
    </CadastrosLayout>
  );
}
