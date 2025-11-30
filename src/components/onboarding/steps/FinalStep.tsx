import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

interface FinalStepProps {
  onComplete: () => void;
  onBack: () => void;
  completing: boolean;
}

export function FinalStep({ onComplete, onBack, completing }: FinalStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <div className="p-6 bg-primary/10 rounded-full">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Parabéns!</h3>
          <p className="text-muted-foreground text-lg">
            Configuração inicial concluída com sucesso
          </p>
        </div>

        <div className="w-full max-w-md space-y-3 pt-4">
          <div className="p-4 bg-card border rounded-lg">
            <h4 className="font-semibold mb-2">O que você pode fazer agora:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Cadastrar mais bancos e produtos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Adicionar clientes ao sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Criar suas primeiras propostas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Gerenciar o fluxo de aprovação</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={completing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={onComplete}
          disabled={completing}
          className="min-w-[160px]"
        >
          {completing ? "Finalizando..." : (
            <>
              Ir para Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}