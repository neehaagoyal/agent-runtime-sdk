import { describe, expect, it } from "vitest";
import { durationMs, type ClockReading } from "../src/trace/timing.js";

describe("trace timing", () => {
  it("calculates non-negative monotonic durations", () => {
    const start: ClockReading = { timestamp: "2026-01-01T00:00:00.000Z", monotonicMs: 10 };
    const end: ClockReading = { timestamp: "2026-01-01T00:00:00.025Z", monotonicMs: 35 };

    expect(durationMs(start, end)).toBe(25);
    expect(durationMs(end, start)).toBe(0);
  });
});
