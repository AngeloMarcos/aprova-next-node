import { z } from 'zod';

export const produtoSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  tipo_credito: z.string()
    .min(1, 'Tipo de crédito é obrigatório'),
  taxa_juros: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Taxa deve ser maior ou igual a 0'),
  status: z.string()
    .min(1, 'Status é obrigatório'),
  banco_id: z.string()
    .optional()
    .or(z.literal('')),
});

export type ProdutoFormValues = z.infer<typeof produtoSchema>;
