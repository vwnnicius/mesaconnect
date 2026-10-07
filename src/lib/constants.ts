import { TableStatus, ServiceCallStatus, UserRole } from '@/types';

export const RESTAURANT_DEMO = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Rodízio Sabor & Grill',
  slug: 'sabor-grill',
};

export const TABLE_STATUS_CONFIG: Record<
  TableStatus,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    dotColor: string;
    icon: string;
  }
> = {
  AVAILABLE: {
    label: 'Disponível',
    description: 'Mesa livre ou sem solicitação ativa',
    color: '#10b981',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
    icon: '🟢',
  },
  CALLING: {
    label: 'Chamando',
    description: 'Cliente solicitou atendimento no botão',
    color: '#f59e0b',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-300 dark:border-amber-700 animate-pulse',
    textColor: 'text-amber-700 dark:text-amber-400',
    dotColor: 'bg-amber-500',
    icon: '🟡',
  },
  ACKNOWLEDGED: {
    label: 'Em Atendimento',
    description: 'Garçom assumiu o chamado na mesa',
    color: '#3b82f6',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-400',
    dotColor: 'bg-blue-500',
    icon: '🔵',
  },
  DO_NOT_DISTURB: {
    label: 'Não Incomodar',
    description: 'Cliente sinalizou que não deseja atendimento',
    color: '#ef4444',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
    textColor: 'text-rose-700 dark:text-rose-400',
    dotColor: 'bg-rose-500',
    icon: '🔴',
  },
  COMPLETED: {
    label: 'Concluído',
    description: 'Atendimento recém finalizado',
    color: '#10b981',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
    icon: '🟢',
  },
  OFFLINE: {
    label: 'Offline',
    description: 'Dispositivo sem sinal ou desconectado',
    color: '#9ca3af',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900',
    borderColor: 'border-zinc-200 dark:border-zinc-800',
    textColor: 'text-zinc-500 dark:text-zinc-400',
    dotColor: 'bg-zinc-400',
    icon: '⚪',
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Proprietário',
  MANAGER: 'Gerente',
  WAITER: 'Garçom',
};

export const CALL_STATUS_LABELS: Record<ServiceCallStatus, string> = {
  CALLING: 'Aguardando Garçom',
  ACKNOWLEDGED: 'Em Atendimento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};
