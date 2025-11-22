import { z } from 'zod';

// Validação de CPF
const validarCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11 || /^(\d)\1+$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit = remainder >= 10 ? 0 : remainder;
  if (digit !== parseInt(numbers.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  digit = remainder >= 10 ? 0 : remainder;
  return digit === parseInt(numbers.charAt(10));
};

export const clienteSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .refine((val) => validarCPF(val), 'CPF inválido'),
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
