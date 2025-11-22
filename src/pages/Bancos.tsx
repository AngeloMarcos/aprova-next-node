import { useState } from 'react';
import { CadastrosLayout } from '@/components/CadastrosLayout';
import { CadastroEmptyState } from '@/components/CadastroEmptyState';
import { Input } from '@/components/ui/input';
import { Search, Building2 } from 'lucide-react';
import { useBancos, Banco } from '@/hooks/useBancos';
import { BancoFormModal } from '@/components/bancos/BancoFormModal';
import { BancosList } from '@/components/bancos/BancosList';
import { DeleteAlertDialog } from '@/components/shared/DeleteAlertDialog';

export default function Bancos() {
  const { bancos, loading, fetchBancos, deleteBanco } = useBancos();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanco, setEditingBanco] = useState<Banco | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bancoToDelete, setBancoToDelete] = useState<string | null>(null);

  const handleEdit = (banco: Banco) => {
    setEditingBanco(banco);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setBancoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bancoToDelete) {
      const success = await deleteBanco(bancoToDelete);
      if (success) {
        setDeleteDialogOpen(false);
        setBancoToDelete(null);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanco(undefined);
  };

  return (
    <CadastrosLayout
      titulo="Bancos"
      descricao="Gerencie os bancos parceiros do sistema"
      botaoNovoLabel="Novo Banco"
      onNovoClick={() => setShowModal(true)}
      isLoading={loading && bancos.length === 0}
    >
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchBancos(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        {bancos.length === 0 && !loading ? (
          <CadastroEmptyState
            titulo="Nenhum banco cadastrado"
            descricao="Comece cadastrando seu primeiro banco parceiro para gerenciar produtos financeiros."
            botaoLabel="Cadastrar Primeiro Banco"
            onNovoClick={() => setShowModal(true)}
            icone={<Building2 className="h-12 w-12" />}
          />
        ) : (
          <BancosList
            bancos={bancos}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />
        )}
      </div>

      <BancoFormModal
        open={showModal}
        onClose={handleCloseModal}
        banco={editingBanco}
        onSuccess={() => {
          handleCloseModal();
          fetchBancos(searchTerm);
        }}
      />

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir este banco? Se houver produtos ou propostas vinculadas, o banco será apenas desativado."
        isLoading={loading}
      />
    </CadastrosLayout>
  );
}
