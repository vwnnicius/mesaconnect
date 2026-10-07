'use client';

import { TableStatus } from '@/types';
import { cn } from '@/lib/utils';

export type FloorTable = { number: string; status: TableStatus; connected?: boolean };
const labels: Record<TableStatus, string> = {
  AVAILABLE: 'Disponível', CALLING: 'Chamando', ACKNOWLEDGED: 'Em atendimento',
  COMPLETED: 'Atendida', DO_NOT_DISTURB: 'Não incomodar', OFFLINE: 'Sem conexão',
};

export function FloorPlan({ tables, selected, onSelect, compact = false }: {
  tables: FloorTable[]; selected?: string; onSelect: (number: string) => void; compact?: boolean;
}) {
  return (
    <div className={cn('floor-plan', compact && 'floor-plan-compact')}>
      <div className="floor-caption"><span>Salão principal</span><span>Distribuição ilustrativa</span></div>
      <div className="floor-room">
        <div className="floor-bar"><span>Bar & cozinha</span><i /><i /><i /></div>
        <div className="floor-tables" role="group" aria-label="Mesas do salão ilustrativo">
          {tables.map((table, index) => (
            <button key={table.number} type="button" onClick={() => onSelect(table.number)}
              aria-pressed={selected === table.number}
              aria-label={`Mesa ${table.number}, ${labels[table.status]}${table.connected === false ? ', botão sem conexão' : ''}`}
              className={cn('floor-seat', selected === table.number && 'floor-seat-selected')}
              data-status={table.status}>
              <span className={cn('floor-furniture', index % 3 === 0 && 'floor-furniture-round')}>
                <span className="floor-chair floor-chair-top" /><span className="floor-chair floor-chair-bottom" />
                <span className="floor-chair floor-chair-left" /><span className="floor-chair floor-chair-right" />
                <span className="floor-number">{table.number}</span>
                <span className="floor-state">{labels[table.status]}</span>
              </span>
              {table.connected === false ? <span className="floor-offline">Offline</span> : null}
            </button>
          ))}
        </div>
        <div className="floor-entrance"><span />Entrada<span /></div>
      </div>
      <div className="floor-legend"><span><i className="legend-available" />Disponível</span><span><i className="legend-calling" />Chamando</span><span><i className="legend-ack" />Em atendimento</span></div>
    </div>
  );
}
