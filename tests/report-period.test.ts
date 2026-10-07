import test from "node:test";
import assert from "node:assert/strict";
import { reportBounds } from "../src/lib/report-period";
test("monthly reports use exclusive next-month bounds in restaurant timezone", () => {
  assert.deepEqual(reportBounds(-1, "2026-12"), {
    started: "2026-12-01T03:00:00.000Z",
    ended: "2027-01-01T03:00:00.000Z",
  });
  assert.deepEqual(reportBounds(-1, "2024-02"), {
    started: "2024-02-01T03:00:00.000Z",
    ended: "2024-03-01T03:00:00.000Z",
  });
});
test("all-history reports omit bounds and malformed calendar months fail closed", () => {
  assert.deepEqual(reportBounds(0), {});
  for (const month of ["2026-00", "2026-13", "bad", undefined])
    assert.throws(() => reportBounds(-1, month));
});
