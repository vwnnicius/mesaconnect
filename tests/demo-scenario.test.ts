import test from 'node:test';
import assert from 'node:assert/strict';
import { demoReducer, initialDemoState, demoStep } from '../src/lib/demo-scenario';

test('demo preserves the complete call lifecycle and accepts one valid evaluation', () => {
  let state = initialDemoState();
  state = demoReducer(state, { type: 'COMPLETE', table: '07', at: 1 });
  assert.equal(state.sequence, 0);
  for (const [type, at] of [['CALL', 1000], ['ACKNOWLEDGE', 2000], ['COMPLETE', 4000]] as const) state = demoReducer(state, { type, table: '07', at });
  assert.equal(state.tables[6].completedAt, 4000);
  state = demoReducer(state, { type: 'RATE', table: '07', rating: 0, at: 4500 });
  assert.equal(state.sequence, 3);
  state = demoReducer(state, { type: 'RATE', table: '07', rating: 4, at: 5000 });
  assert.equal(demoStep(state.tables[6]), 4);
  assert.equal(state.events.length, 4);
  assert.equal(demoReducer(state, { type: 'RATE', table: '07', rating: 5, at: 6000 }), state);
});

test('device outage blocks new calls, while waiter can finish a previously delivered call', () => {
  let state = demoReducer(initialDemoState(), { type: 'CONNECTION', table: '07', at: 1 });
  assert.equal(demoReducer(state, { type: 'CALL', table: '07', at: 2 }), state);
  state = demoReducer(state, { type: 'CONNECTION', table: '07', at: 3 });
  state = demoReducer(state, { type: 'CALL', table: '07', at: 4 });
  assert.equal(demoReducer(state, { type: 'CALL', table: '07', at: 5 }), state);
  state = demoReducer(state, { type: 'CONNECTION', table: '07', at: 6 });
  state = demoReducer(state, { type: 'ACKNOWLEDGE', table: '07', at: 7 });
  assert.equal(state.tables[6].status, 'ACKNOWLEDGED');
});

test('tables remain independent and reset clears every simulated event', () => {
  let state = demoReducer(initialDemoState(), { type: 'CALL', table: '02', at: 1 });
  state = demoReducer(state, { type: 'SELECT', table: '02' });
  assert.equal(state.selected, '02');
  assert.equal(state.tables[6].status, 'AVAILABLE');
  assert.equal(demoReducer(state, { type: 'SELECT', table: '99' }), state);
  assert.deepEqual(demoReducer(state, { type: 'RESET' }), initialDemoState());
});
