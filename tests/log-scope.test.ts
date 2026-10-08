import { test } from "node:test";
import assert from "node:assert/strict";
import { logScope } from "../supabase/functions/workspace-admin/log-scope";
test("log cleanup rejects unspecified scope and invalid unit", () => {
  assert.throws(() => logScope({ scope: "unknown" }));
  assert.throws(() => logScope({ scope: "unit", restaurant_id: "all" }));
  for (const restaurant_id of [null, undefined, "", 123]) {
    assert.throws(() => logScope({ scope: "unit", restaurant_id }));
  }
});
test("cleanup requires exact confirmation and recent past cutoff", () => {
  const now = Date.parse("2026-10-07T12:00:00Z");
  const body = {
    action: "clear_logs",
    scope: "all",
    confirmation: "LIMPAR TODOS OS LOGS",
    cutoff: "2026-10-07T11:59:00Z",
  };
  assert.equal(logScope(body, now).unit, null);
  assert.throws(() => logScope({ ...body, confirmation: "sim" }, now));
  assert.throws(() =>
    logScope({ ...body, cutoff: "2026-10-07T12:01:00Z" }, now),
  );
  assert.throws(() =>
    logScope({ ...body, cutoff: "2026-10-07T11:00:00Z" }, now),
  );
  assert.throws(() => logScope({ ...body, cutoff: "invalid" }, now));
});
test("unit cleanup cannot reuse the global confirmation", () => {
  const now = Date.now();
  const body = {
    action: "clear_logs",
    scope: "unit",
    restaurant_id: "0a24160a-1cbd-476b-9ccd-2b85e08ec5a4",
    cutoff: new Date(now - 1000).toISOString(),
    confirmation: "LIMPAR LOGS DESTE ESTABELECIMENTO",
  };
  assert.equal(logScope(body, now).unit, body.restaurant_id);
  assert.throws(() =>
    logScope({ ...body, confirmation: "LIMPAR TODOS OS LOGS" }, now),
  );
});
