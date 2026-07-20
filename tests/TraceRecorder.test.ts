import { describe, expect, it } from "vitest";
import { TraceRecorder } from "../src/trace/TraceRecorder.js";
import type { TraceClock } from "../src/trace/timing.js";

function fakeClock(): TraceClock {
  let tick = 0;
  return { now: () => ({ timestamp: new Date(Date.UTC(2026, 0, 1, 0, 0, tick++)).toISOString(), monotonicMs: tick * 10 }) };
}

describe("TraceRecorder", () => {
  it("creates ordered events and durations", () => {
    const recorder = new TraceRecorder({ clock: fakeClock(), runId: "run-test" });
    recorder.startRun({ input: "hello" });
    const start = recorder.recordProviderRequest("mock", { input: "hello" });
    recorder.recordProviderResponse("mock", { text: "hi", metadata: { provider: "mock", finishReason: "stop" } }, start);
    const trace = recorder.endRun(true);

    expect(trace.runId).toBe("run-test");
    expect(trace.durationMs).toBeGreaterThan(0);
    expect(trace.events.map((event) => event.type)).toEqual([
      "runtime.start",
      "provider.request",
      "provider.response",
      "runtime.end",
    ]);
    expect(trace.events[2]).toMatchObject({ durationMs: 10 });
  });
});
