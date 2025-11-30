import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { OnboardingData } from "../OnboardingWizard";
import { useState } from "react";

const bancoSchema = yup.object({
  nome: yup
    .string()
    .required("Nome do banco é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres"),
  cnpj: yup
    .string()
    .transform((value) => value?.replace(/\D/g, ""))
    .matches(/^\d{14}$/, "CNPJ deve ter 14 dígitos")
    .optional(),
});

interface BancoForm {
  nome: string;
  cnpj?: string;
}

interface BancoStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function BancoStep({ data, updateData, onNext }: BancoStepProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BancoForm>({
    resolver: yupResolver(bancoSchema) as any,
    defaultValues: {
      nome: data.banco?.nome || "",
      cnpj: data.banco?.cnpj || "",
    },
  });

  const onSubmit = async (formData: BancoForm) => {
    if (!profile?.empresa_id) {
      toast.error("Erro ao identificar empresa");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("bancos").insert({
        nome: formData.nome,
        cnpj: formData.cnpj,
        empresa_id: profile.empresa_id,
        ativo: true,
      });

      if (error) throw error;

      updateData({ banco: formData });
      toast.success("Banco cadastrado com sucesso!");
      onNext();
    } catch (error: any) {
      toast.error("Erro ao cadastrar banco", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
        <div className="p-3 bg-primary/10 rounded-full">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Cadastre seu primeiro banco</h3>
          <p className="text-sm text-muted-foreground">
            Adicione um banco parceiro para começar a gerenciar propostas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Banco *</Label>
          <Input
            id="nome"
            placeholder="Ex: Banco do Brasil"
            {...register("nome")}
            disabled={loading}
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ (opcional)</Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            {...register("cnpj")}
            disabled={loading}
          />
          {errors.cnpj && (
            <p className="text-sm text-destructive">{errors.cnpj.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? "Salvando..." : "Próximo"}
          </Button>
        </div>
      </form>
    </div>
  );
}