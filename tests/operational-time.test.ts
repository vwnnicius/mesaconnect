import { test } from "node:test";
import assert from "node:assert/strict";
import { operationalTime } from "../src/lib/operational-time";
test("operational durations preserve missing data and round across minute boundaries", () => {
  assert.equal(operationalTime(null), "—");
  assert.equal(operationalTime(NaN), "—");
  assert.equal(operationalTime(0), "0s");
  assert.equal(operationalTime(59.6), "1m 00s");
  assert.equal(operationalTime(102), "1m 42s");
});
