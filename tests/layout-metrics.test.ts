import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeLayout } from "../src/lib/floor-layout";
import { operationMetrics } from "../src/lib/operation-metrics";
import type { ServiceCall } from "../src/types";
test("saved layouts retain known tables and bound malformed or stale coordinates", () => {
  const plan = normalizeLayout(
    {
      name: "Varanda",
      positions: [
        {
          number: "01",
          x: Infinity,
          y: -100,
          shape: "round",
          seats: 50,
          sector: "Varanda",
          rotation: 900,
        },
        { number: "99", x: 22, y: 33 },
      ],
    },
    ["01", "02"],
  );
  assert.equal(plan.positions.length, 2);
  assert.equal(plan.positions[0].shape, "round");
  assert.equal(plan.positions[0].y, 12);
  assert.equal(plan.positions[0].seats, 12);
  assert.equal(plan.positions[0].rotation, 360);
  assert.ok(Number.isFinite(plan.positions[0].x));
  assert.equal(plan.positions[1].number, "02");
});
test("response metrics ignore unfinished stages and use the actual even median", () => {
  const base = {
    id: "",
    restaurant_id: "",
    table_id: "",
    requested_at: "2026-10-07T10:00:00Z",
    requested_by: null,
    acknowledged_by: null,
    completed_by: null,
    created_at: "",
    completed_at: null,
  };
  const calls = [
    {
      ...base,
      status: "ACKNOWLEDGED",
      acknowledged_at: "2026-10-07T10:01:00Z",
    },
    {
      ...base,
      status: "ACKNOWLEDGED",
      acknowledged_at: "2026-10-07T10:03:00Z",
    },
    { ...base, status: "CALLING", acknowledged_at: null },
  ] as ServiceCall[];
  const m = operationMetrics(calls, []);
  assert.equal(m.response, 120);
  assert.equal(m.median, 120);
  assert.equal(m.duration, null);
  assert.equal(m.sla, 50);
  assert.equal(m.rating, null);
});
