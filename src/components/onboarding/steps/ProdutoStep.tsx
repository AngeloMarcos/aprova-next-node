import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { OnboardingData } from "../OnboardingWizard";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const produtoSchema = yup.object({
  nome: yup
    .string()
    .required("Nome do produto é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres"),
  tipo_credito: yup
    .string()
    .required("Tipo de produto é obrigatório"),
});

interface ProdutoForm {
  nome: string;
  tipo_credito: string;
}

interface ProdutoStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const tiposCredito = [
  { value: "credito_pessoal", label: "Crédito Pessoal" },
  { value: "consorcio", label: "Consórcio" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "credito_imobiliario", label: "Crédito Imobiliário" },
  { value: "credito_veicular", label: "Crédito Veicular" },
];

export function ProdutoStep({ data, updateData, onNext, onBack }: ProdutoStepProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bancoId, setBancoId] = useState<string>("");
  const [tipoCreditoValue, setTipoCreditoValue] = useState<string>(
    data.produto?.tipo_credito || ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProdutoForm>({
    resolver: yupResolver(produtoSchema) as any,
    defaultValues: {
      nome: data.produto?.nome || "",
      tipo_credito: data.produto?.tipo_credito || "",
    },
  });

  useEffect(() => {
    // Buscar o banco cadastrado no passo anterior
    const fetchBanco = async () => {
      if (!profile?.empresa_id) return;

      const { data: bancos } = await supabase
        .from("bancos")
        .select("id")
        .eq("empresa_id", profile.empresa_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (bancos && bancos.length > 0) {
        setBancoId(bancos[0].id);
      }
    };

    fetchBanco();
  }, [profile]);

  const onSubmit = async (formData: ProdutoForm) => {
    if (!profile?.empresa_id) {
      toast.error("Erro ao identificar empresa");
      return;
    }

    if (!bancoId) {
      toast.error("Banco não encontrado");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("produtos").insert({
        nome: formData.nome,
        tipo_credito: formData.tipo_credito,
        banco_id: bancoId,
        empresa_id: profile.empresa_id,
        ativo: true,
        status: "ativo",
      });

      if (error) throw error;

      updateData({ produto: formData });
      toast.success("Produto cadastrado com sucesso!");
      onNext();
    } catch (error: any) {
      toast.error("Erro ao cadastrar produto", {
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
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Cadastre seu primeiro produto</h3>
          <p className="text-sm text-muted-foreground">
            Configure um produto financeiro para oferecer aos seus clientes
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Produto *</Label>
          <Input
            id="nome"
            placeholder="Ex: Crédito Pessoal Premium"
            {...register("nome")}
            disabled={loading}
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_credito">Tipo de Produto *</Label>
          <Select
            value={tipoCreditoValue}
            onValueChange={(value) => {
              setTipoCreditoValue(value);
              setValue("tipo_credito", value);
            }}
            disabled={loading}
          >
            <SelectTrigger id="tipo_credito">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposCredito.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipo_credito && (
            <p className="text-sm text-destructive">{errors.tipo_credito.message}</p>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? "Salvando..." : "Próximo"}
          </Button>
        </div>
      </form>
    </div>
  );
}