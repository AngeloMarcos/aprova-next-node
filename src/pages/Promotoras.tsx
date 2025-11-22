import { useState, useEffect } from 'react';
import { CadastrosLayout } from '@/components/CadastrosLayout';
import { CadastroEmptyState } from '@/components/CadastroEmptyState';
import { usePromotoras } from '@/hooks/usePromotoras';
import { Building2 } from 'lucide-react';

export default function Promotoras() {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [promotoras, setPromotoras] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  
  const { loading, fetchPromotoras } = usePromotoras();

  const loadPromotoras = async () => {
    const result = await fetchPromotoras(currentPage, 10, searchTerm);
    setPromotoras(result.data);
    setTotalPages(result.totalPages);
  };

  useEffect(() => {
    loadPromotoras();
  }, [currentPage, searchTerm]);

  return (
    <CadastrosLayout
      titulo="Promotoras"
      descricao="Gerencie as promotoras de crédito"
      botaoNovoLabel="Nova Promotora"
      onNovoClick={() => setShowModal(true)}
      isLoading={loading && promotoras.length === 0}
    >
      {promotoras.length === 0 && !loading ? (
        <CadastroEmptyState
          titulo="Nenhuma promotora cadastrada"
          descricao="Comece cadastrando sua primeira promotora de crédito para gerenciar as operações."
          botaoLabel="Cadastrar Primeira Promotora"
          onNovoClick={() => setShowModal(true)}
          icone={<Building2 className="h-12 w-12" />}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Lista de promotoras (CRUD será implementado em breve)</p>
        </div>
      )}
    </CadastrosLayout>
  );
}
