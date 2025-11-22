import { useState } from 'react';
import { CadastrosLayout } from '@/components/CadastrosLayout';
import { CadastroEmptyState } from '@/components/CadastroEmptyState';
import { Input } from '@/components/ui/input';
import { Search, UserCircle } from 'lucide-react';
import { usePromotoras, Promotora } from '@/hooks/usePromotoras';
import { PromotoraFormModal } from '@/components/promotoras/PromotoraFormModal';
import { PromotorasList } from '@/components/promotoras/PromotorasList';
import { DeleteAlertDialog } from '@/components/shared/DeleteAlertDialog';

export default function Promotoras() {
  const { promotoras, loading, fetchPromotoras, deletePromotora } = usePromotoras();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPromotora, setEditingPromotora] = useState<Promotora | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotoraToDelete, setPromotoraToDelete] = useState<string | null>(null);

  const handleEdit = (promotora: Promotora) => {
    setEditingPromotora(promotora);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setPromotoraToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (promotoraToDelete) {
      const success = await deletePromotora(promotoraToDelete);
      if (success) {
        setDeleteDialogOpen(false);
        setPromotoraToDelete(null);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromotora(undefined);
  };

  return (
    <CadastrosLayout
      titulo="Promotoras"
      descricao="Gerencie as promotoras de crédito"
      botaoNovoLabel="Nova Promotora"
      onNovoClick={() => setShowModal(true)}
      isLoading={loading && promotoras.length === 0}
    >
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou contato..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchPromotoras(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        {promotoras.length === 0 && !loading ? (
          <CadastroEmptyState
            titulo="Nenhuma promotora cadastrada"
            descricao="Comece cadastrando sua primeira promotora de crédito para gerenciar as operações."
            botaoLabel="Cadastrar Primeira Promotora"
            onNovoClick={() => setShowModal(true)}
            icone={<UserCircle className="h-12 w-12" />}
          />
        ) : (
          <PromotorasList
            promotoras={promotoras}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />
        )}
      </div>

      <PromotoraFormModal
        open={showModal}
        onClose={handleCloseModal}
        promotora={editingPromotora}
        onSuccess={() => {
          handleCloseModal();
          fetchPromotoras(searchTerm);
        }}
      />

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta promotora? Se houver propostas vinculadas, a promotora será apenas desativada."
        isLoading={loading}
      />
    </CadastrosLayout>
  );
}
