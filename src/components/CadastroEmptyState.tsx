import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface CadastroEmptyStateProps {
  titulo: string;
  descricao: string;
  botaoLabel: string;
  onNovoClick: () => void;
  icone?: React.ReactNode;
}

export function CadastroEmptyState({
  titulo,
  descricao,
  botaoLabel,
  onNovoClick,
  icone,
}: CadastroEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
        {icone && <div className="mb-4 text-muted-foreground">{icone}</div>}
        <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
          {descricao}
        </p>
        <Button onClick={onNovoClick}>
          <Plus className="h-4 w-4" />
          {botaoLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
