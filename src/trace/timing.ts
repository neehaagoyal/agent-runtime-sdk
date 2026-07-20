export interface ClockReading {
  timestamp: string;
  monotonicMs: number;
}

export interface TraceClock {
  now(): ClockReading;
}

export class SystemTraceClock implements TraceClock {
  now(): ClockReading {
    return {
      timestamp: new Date().toISOString(),
      monotonicMs: getMonotonicMilliseconds(),
    };
  }
}

export function durationMs(start: ClockReading, end: ClockReading): number {
  return Math.max(0, end.monotonicMs - start.monotonicMs);
}

function getMonotonicMilliseconds(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}
