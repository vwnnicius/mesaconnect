'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useCalls } from '@/hooks/useCalls';
import { useTables } from '@/hooks/useTables';
import { FloorPlan } from '@/components/tables/FloorPlan';
import { CallCard } from '@/components/calls/CallCard';

export default function DashboardPage() {
  const { calls, loading, error, acknowledge, complete } = useCalls();
  const { tables, loading: tablesLoading } = useTables();
  const [selected, setSelected] = useState<string | undefined>();
  const waiting = calls.filter((call) => call.status === 'CALLING');
  const serving = calls.filter((call) => call.status === 'ACKNOWLEDGED');
  const queue = [...waiting, ...serving];
  const selectedTable = tables.find((table) => table.number === selected);
  const selectedCalls = selectedTable ? queue.filter((call) => call.table_id === selectedTable.id) : queue;

  return (
    <div>
      <div className="operation-heading">
        <div><p className="eyebrow">MesaConnect / Operação</p><h1>Seu salão,<br /><span className="editorial-word">agora.</span></h1><p>As mesas, a equipe e o próximo atendimento.<br />Um olhar para o que precisa de atenção.</p></div>
        <Link href="/calls" className="action-solid">Abrir fila de atendimento<ArrowRight size={15} /></Link>
      </div>
      <div className="operation-summary" aria-label="Resumo da operação">
        <div><strong>{loading ? '—' : waiting.length}</strong><span>mesas esperando</span></div>
        <div><strong>{loading ? '—' : serving.length}</strong><span>em atendimento</span></div>
        <div><strong>{tablesLoading ? '—' : tables.length}</strong><span>mesas no salão</span></div>
      </div>
      {error ? <p role="alert" className="mt-5 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      <div className="operation-grid">
        <section>
          <div className="operation-title"><h2>O salão em perspectiva</h2><Link href="/tables">Ver mesas</Link></div>
          {tablesLoading ? <p className="operation-empty">Carregando mesas…</p> : tables.length ? <FloorPlan tables={tables} selected={selected} onSelect={(number) => setSelected(selected === number ? undefined : number)} compact /> : <p className="operation-empty">Nenhuma mesa disponível.</p>}
          <p className="operation-note">A posição das mesas é ilustrativa. Selecione uma mesa para ver seus chamados; toque novamente para mostrar toda a fila.</p>
        </section>
        <section>
          <div className="operation-title"><h2>{selected ? `Mesa ${selected}` : 'Precisam de você'}</h2>{selected ? <button type="button" onClick={() => setSelected(undefined)} className="text-xs min-h-11 underline text-muted-foreground">Ver toda a fila</button> : <Link href="/calls">Fila completa</Link>}</div>
          <div className="operation-queue">
            {loading ? <div className="operation-empty">Carregando fila…</div> : error ? <div className="operation-empty">Fila indisponível<p>Confira a conexão antes de continuar.</p></div> : selectedCalls.length === 0 ? <div className="operation-empty">Tudo em ordem por aqui.<p>{selected ? 'Esta mesa não tem chamado ativo.' : 'Quando uma mesa chamar, ela aparece aqui.'}</p></div> : selectedCalls.slice(0, 3).map((call) => <CallCard key={call.id} call={call} onAcknowledge={acknowledge} onComplete={complete} />)}
          </div>
          {selectedCalls.length > 3 ? <Link href="/calls" className="inline-block text-xs underline mt-5">Mais {selectedCalls.length - 3} chamados na fila</Link> : null}
        </section>
      </div>
      <div className="operation-demo-link"><div><p className="eyebrow mb-2">Conheça a experiência</p><h2>Do botão ao atendimento.</h2><p>Explore o salão e experimente todo o percurso em uma demo interativa.</p></div><Link href="/demo" className="action-outline"><Play size={14} />Experimentar demo</Link></div>
    </div>
  );
}
