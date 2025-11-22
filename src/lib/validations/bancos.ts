import { z } from 'zod';

export const bancoSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  cnpj: z.string()
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  telefone: z.string()
    .optional()
    .or(z.literal('')),
});

export type BancoFormValues = z.infer<typeof bancoSchema>;
