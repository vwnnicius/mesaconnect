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
    textColor: 'text-emerald-800 dark:text-emerald-400',
    dotColor: 'bg-emerald-600',
    icon: '',
  },
  CALLING: {
    label: 'Chamando',
    description: 'Cliente solicitou atendimento no botão',
    color: '#c2410c',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-800 dark:text-orange-300',
    dotColor: 'bg-orange-600',
    icon: '',
  },
  ACKNOWLEDGED: {
    label: 'Em atendimento',
    description: 'Garçom assumiu o chamado na mesa',
    color: '#1d4ed8',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-300',
    dotColor: 'bg-blue-600',
    icon: '',
  },
  DO_NOT_DISTURB: {
    label: 'Não incomodar',
    description: 'Cliente sinalizou que não deseja atendimento',
    color: '#b91c1c',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-300',
    dotColor: 'bg-red-600',
    icon: '',
  },
  COMPLETED: {
    label: 'Concluído',
    description: 'Atendimento recém finalizado',
    color: '#047857',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-800 dark:text-emerald-400',
    dotColor: 'bg-emerald-600',
    icon: '',
  },
  OFFLINE: {
    label: 'Offline',
    description: 'Dispositivo sem sinal ou desconectado',
    color: '#78716c',
    bgColor: 'bg-stone-100 dark:bg-stone-900',
    borderColor: 'border-stone-200 dark:border-stone-800',
    textColor: 'text-stone-500 dark:text-stone-400',
    dotColor: 'bg-stone-400',
    icon: '',
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
