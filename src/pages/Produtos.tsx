import { useState } from 'react';
import { CadastrosLayout } from '@/components/CadastrosLayout';
import { CadastroEmptyState } from '@/components/CadastroEmptyState';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Package } from 'lucide-react';
import { useProdutos, Produto } from '@/hooks/useProdutos';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { ProdutoFormModal } from '@/components/produtos/ProdutoFormModal';
import { ProdutosList } from '@/components/produtos/ProdutosList';
import { DeleteAlertDialog } from '@/components/shared/DeleteAlertDialog';

export default function Produtos() {
  const { 
    loading, 
    fetchProdutos, 
    deleteProduto,
    updateProdutoStatus 
  } = useProdutos();
  const { bancos } = useBancosSelect();
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [bancoFilter, setBancoFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);

  const loadProdutos = async () => {
    const result = await fetchProdutos(1, 50, {
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      banco_id: bancoFilter || undefined,
    });
    setProdutos(result.data);
  };

  const handleSearch = () => {
    loadProdutos();
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setProdutoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (produtoToDelete) {
      const success = await deleteProduto(produtoToDelete);
      if (success) {
        setDeleteDialogOpen(false);
        setProdutoToDelete(null);
        handleSearch();
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateProdutoStatus(id, newStatus);
    handleSearch();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduto(undefined);
  };

  return (
    <CadastrosLayout
      titulo="Produtos"
      descricao="Gerencie os produtos financeiros oferecidos"
      botaoNovoLabel="Novo Produto"
      onNovoClick={() => setShowModal(true)}
      isLoading={loading && produtos.length === 0}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bancoFilter} onValueChange={setBancoFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Banco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {bancos.map((banco) => (
                <SelectItem key={banco.value} value={banco.value}>
                  {banco.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {produtos.length === 0 && !loading ? (
          <CadastroEmptyState
            titulo="Nenhum produto cadastrado"
            descricao="Comece cadastrando seu primeiro produto financeiro para oferecer aos clientes."
            botaoLabel="Cadastrar Primeiro Produto"
            onNovoClick={() => setShowModal(true)}
            icone={<Package className="h-12 w-12" />}
          />
        ) : (
          <ProdutosList
            produtos={produtos}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            isLoading={loading}
          />
        )}
      </div>

      <ProdutoFormModal
        open={showModal}
        onClose={handleCloseModal}
        produto={editingProduto}
        onSuccess={() => {
          handleCloseModal();
          handleSearch();
        }}
      />

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir este produto? Se houver propostas vinculadas, o produto será apenas desativado."
        isLoading={loading}
      />
    </CadastrosLayout>
  );
}
