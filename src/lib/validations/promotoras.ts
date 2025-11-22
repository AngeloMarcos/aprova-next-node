import { z } from 'zod';

export const promotoraSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  banco_id: z.string()
    .min(1, 'Banco é obrigatório'),
  telefone: z.string()
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  contato: z.string()
    .optional()
    .or(z.literal('')),
  comissao_padrao: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, 'Comissão deve estar entre 0 e 100%'),
});

export type PromotoraFormValues = z.infer<typeof promotoraSchema>;
