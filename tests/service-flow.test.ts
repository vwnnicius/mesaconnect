import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inMemoryStore } from '../src/services/mockStore';
import { createServiceCall, acknowledgeServiceCall, completeServiceCall, getActiveCalls } from '../src/services/callsService';
import { getTableByNumber } from '../src/services/tablesService';
import { createEvaluation } from '../src/services/evaluationsService';
import { processDeviceEvent } from '../src/services/deviceService';

// Isolated local demonstration: these tests must never write to a real Supabase project.
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

test('simulator uses domain services; complete requires acknowledgement and releases the table', async () => {
  const table = await getTableByNumber('sabor-grill', '01');
  assert.ok(table);
  const event = await processDeviceEvent({ device_uid: 'MESA-001-ESP32', event_type: 'CALL' });
  assert.equal(event.success, true);
  assert.ok(event.call_id);
  const call = inMemoryStore.getCalls().find((c) => c.id === event.call_id);
  assert.equal(call?.status, 'CALLING');
  assert.equal(await completeServiceCall(event.call_id), false);
  assert.equal(await acknowledgeServiceCall(event.call_id), true);
  assert.ok(call?.acknowledged_at);
  const acknowledgedAt = call.acknowledged_at;
  assert.equal(await acknowledgeServiceCall(event.call_id), false);
  assert.equal(call.acknowledged_at, acknowledgedAt);
  assert.equal(await completeServiceCall(event.call_id), true);
  assert.ok(call.completed_at);
  assert.equal(call.status, 'COMPLETED');
  assert.equal(inMemoryStore.getTables().find((t) => t.id === table.id)?.status, 'AVAILABLE');
  assert.equal(await completeServiceCall(event.call_id), false);
});

test('duplicate local button events reuse the active call', async () => {
  const table = await getTableByNumber('sabor-grill', '02');
  assert.ok(table);
  const first = await createServiceCall({ tableId: table.id });
  const second = await createServiceCall({ tableId: table.id });
  assert.equal(first?.id, second?.id);
  assert.equal(inMemoryStore.getCalls().filter((c) => c.table_id === table.id && c.status === 'CALLING').length, 1);
});

test('device UIDs resolve their actual table and unknown devices fail', async () => {
  const event = await processDeviceEvent({ device_uid: 'MESA-009-ESP32', event_type: 'CALL' });
  assert.equal(event.success, true);
  assert.equal(event.table_number, '09');
  for (const device_uid of ['unknown', 'MESA-999-ESP32']) {
    const result = await processDeviceEvent({ device_uid, event_type: 'CALL' });
    assert.equal(result.success, false);
  }
});

test('invalid public evaluation links cannot resolve to a demonstration table', async () => {
  assert.equal(await getTableByNumber('outro-restaurante', '07'), null);
  assert.equal(await getTableByNumber('sabor-grill', '999'), null);
});

test('evaluation uses resolved table and restaurant identifiers and validates rating', async () => {
  const table = await getTableByNumber('sabor-grill', '03');
  assert.ok(table);
  const evaluation = await createEvaluation({ restaurantId: table.restaurant_id, tableId: table.id, rating: 4 });
  assert.equal(evaluation?.table_id, table.id);
  assert.equal(evaluation?.restaurant_id, table.restaurant_id);
  for (const rating of [0, 6, 1.5]) {
    await assert.rejects(createEvaluation({ tableId: table.id, rating }));
  }
});

test('Supabase failures never become locally successful calls or evaluations', async () => {
  const originalFetch = globalThis.fetch;
  const callsBefore = inMemoryStore.getCalls().length;
  const evaluationsBefore = inMemoryStore.getEvaluations().length;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://unit-test.invalid';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-public-key';
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Access denied', code: '42501' }), {
    status: 403, headers: { 'Content-Type': 'application/json' },
  });
  try {
    await assert.rejects(createServiceCall({ tableId: 'denied-table' }), /Access denied/);
    await assert.rejects(createEvaluation({ tableId: 'denied-table', rating: 4 }), /Access denied/);
    await assert.rejects(getActiveCalls(), /Access denied/);
    assert.equal(inMemoryStore.getCalls().length, callsBefore);
    assert.equal(inMemoryStore.getEvaluations().length, evaluationsBefore);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  }
});
